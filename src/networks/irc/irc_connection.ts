
import { Connection, IConnection } from '../base/connection';
import { MessageBuffer } from './message_buffer';
import { Timer } from '../../utilities/timer';
import * as Hook from '../../utilities/hook';
import { IrcServer } from './irc_server';
import { Handler } from './handler';
import { Bot } from '../../bot';
import { Socket } from 'net';
import { Irc } from './irc';
import * as tls  from 'tls';
import * as _ from 'lodash';

export class IrcConnection extends Connection implements IIrcConnection {

  public reconnect_attempts = 0;
  public request_disconnect: boolean;
  public capabilities: { requested: string[], enabled: string[] } = { requested: [], enabled: [] };
  public registered: boolean;
  public server: IrcServer;

  // the actual nick in use
  public nick: string;

  private reconnect_timer: Timer;
  private handler: Handler;
  private pong_timer: Timer;
  private _ping_delay: number;
  private message_buffer: MessageBuffer;
  public reconnect_delay: number = IrcConnection.DEFAULT_DELAY;

  private static MIN_PING      = 15000;
  private static DEFAULT_PING  = 120000;
  private static MAX_PING      = 300000;
  private static DEFAULT_DELAY = 5000;

  constructor( public network: Irc, options: IrcConnectionOptions ) {
    super( network );

    this.ping_delay = options.ping_delay;

    this.handler = new Handler( this.network );

    this.message_buffer = new MessageBuffer( this );

    this.reconnect_timer = this.network.Timer({
      infinite: false,
      interval: this.reconnect_delay,
      reference: `reconnect_timer_${ this.network.name }`,
    }, this.network.connect.bind( this.network ) );

    this.setupListeners();
  }

  /**
  * Connect to the IRCD
  * @return <void>
  */
  public connect(): void {
    if ( this.connected() ) {
      this.network.bot.emit( 'network_already_connected::'+ this.network.name, this.network, this.server );
      return;
    }

    let socket_connect_event: string;

    this.request_disconnect = false;
    this.registered = false;

    // reg_listen should be a connection property
    this.handler.setRegistrationListener( this.network.reg_listen );

    Hook.pre( 'connect', this );

    socket_connect_event = 'connect';

    if ( this.server.ssl ) {

      this.socket = tls.connect( {
        rejectUnauthorized: this.network.reject_invalid_certs,
        host: this.server.host,
        port: this.server.port
      } );

      socket_connect_event = 'secureConnect';
    }
    else {
      this.socket = new Socket();
      this.socket.connect( this.server.port, this.server.host );
    }

    this.socket.on( socket_connect_event, this.connectionSetup.bind( this ) )
      .on( 'error', this.onError.bind( this ) );
  }

  get ping_delay(): number {
    return this._ping_delay;
  }

  set ping_delay( delay: number ) {
    let to_milliseconds = delay * 1000;
      if ( !to_milliseconds
          || ( Math.floor(delay) < IrcConnection.MIN_PING
              && ( to_milliseconds > IrcConnection.MAX_PING
                  || to_milliseconds < IrcConnection.MIN_PING ) )
          || delay > IrcConnection.MAX_PING ) {
        delay = IrcConnection.DEFAULT_PING;
      }
      else if ( delay < IrcConnection.MIN_PING && to_milliseconds <= IrcConnection.MAX_PING ) {
        delay = to_milliseconds;
      }

    this._ping_delay = Math.floor( delay );

    if ( this.pong_timer ) {
      this.pong_timer.restart( this.ping_delay );
    }
  }

  private connectionSetup(): void {
    this.pipeSetup();

    this._connected = true;

    this.sendCapLs();

    this.sendLogin();

    this.socket.on( 'data', this.message_buffer.onData.bind( this.message_buffer ) );
    this.socket.on( 'end', this.onEnd.bind( this ) );
    this.socket.on( 'close', this.onClose.bind( this ) );

    this.network.bot.emit( 'connect::' + this.network.name, this.network, this.server );
  }

  private pipeSetup(): void {
    this.buffer.pipe( this.socket );
    this.buffer.on( 'pause', () => {
      this.buffer.once( 'drain', () => {
        this.buffer.resume();
      });
    });
  }

  /**
  * Disconnect from the network
  * @param <string> message: The quit message to send
  * @return <void>
  */
  public disconnect( callback?: Function ): void;
  public disconnect( message?: string ): void;
  public disconnect( message: string, callback: Function ): void;
  public disconnect( message: any = this.network.quit_message, callback?: Function ): void {
    if ( typeof message === 'function' ) {
      callback = message;
      message = this.network.quit_message;
    }

    if ( !this.connected() && !this.socket ) {
      return callback && callback( null );
    }

    this.request_disconnect = true;

    this.send( `QUIT :${ message }` );
    this.send( null );

    setTimeout( ()=> {
      process.nextTick( this.end.bind( this ) );
    }, 100 );

    callback && callback( null );
  }

  public dispose(): void {
    if ( this.connected() )
      this.disconnect();

    if ( this.reconnect_timer )
      this.reconnect_timer.stop();

    if ( this.socket )
      this.end();

    this.network.dispose();

    if ( this.pong_timer ) {
      this.pong_timer.stop();
      this.pong_timer = null;
    }

    this.server && this.server.dispose();
    this.server = null;
  }

  public end(): void {
    this.network.clearTimers();
    this.buffer.unpipe( this.socket );
    this.disposeSocket();
  }

  // more on this later...
  public send( data: string, callback?: Function ): void {
    if ( this.connected() && this.socket )
      this.buffer.push( data + '\r\n' );
  }

  /**
  * Called when the socket connection is closed
  * @param <boolean> error: Did the socket connection close because of an error?
  * @return <void>
  */
  private onClose( error: boolean ): void {

    this._connected = false;

    if ( !this.request_disconnect )
      this.reconnect();
  }

  /**
  * Called if the socket has an error
  * @param <any> e: The Error type objct that gets passed
  * @return <void>
  * @private
  */
  private onError( e: any ): void {
    this.network.bot.Logger.error( `an ${ e.code } error occured`, e );

    this._connected = false;

    switch ( e.code ) {
      case 'ECONNRESET':
      case 'EPIPE':

        return this.reconnect();
      case 'ENETUNREACH':
        this.server.disable();
        return this.network.jump();

      case 'ETIMEDOUT':
        if ( this.reconnect_attempts >= this.network.connection_attempts ) {
          this.server.disable();
          this.reconnect_attempts = 0;
          return this.network.jump();
        }

        this.reconnect_attempts++;
        this.reconnect();
        break;
      default: {
        this.network.bot.Logger.error( 'an unmanaged error occurred', e );
      }
    }
  }

  /**
  * Setup the reconnect timer to delay reconnection to the current server
  * @return <void>
  */
  private reconnect(): void {
    this.reconnect_delay = this.reconnect_delay * ( this.reconnect_attempts + 1 ) || this.reconnect_delay;

    if ( this.reconnect_delay > Math.pow( 8, 7 ) )
      this.reconnect_delay = Math.pow( 8, 7 );

    this.network.bot.Logger.info( `setting timer to delay ${ this.server.host } reconnection for ${ this.reconnect_delay / 1000 } seconds on network ${ this.network.name }` );

    this.reconnect_timer.interval = this.reconnect_delay;
    this.reconnect_timer.start();
  }

  /**
  * What to do after a successful registration
  * @return <void>
  */
  private onRegistered( network: Irc ): void {
    this.registered = true;
    this.reconnect_attempts = 0;
    this.reconnect_delay = IrcConnection.DEFAULT_DELAY;

    Hook.post( 'connect', this.network );

    if ( this.network.use_ping_timer ) {
      this.pong_timer = this.network.Timer(
        {
          interval: this.ping_delay,
          autoStart: true,
          blocking: false,
          ignoreErrors: true,
          immediate: true,
          emitLevel: 0,
          reference: 'pong::' + this.network.name,
          stopOn: 'disconnect::' + this.network.name,
          restartOn: 'registered::' + this.network.name
        }, this.pong.bind( this ) );
    }
  }

  private onEnd(): void {
    this._connected = false;

    if ( this.request_disconnect ) {

    } else {
      // do things to reconnect ( should we assume or have a reconnect: boolean setting ?)
    }
  }

  /**
  * Sends a PONG message to the IRC server
  * @param <string> message: the message to include
  * @return <void>
  */
  public pong( done?: Function ): void;
  public pong( message: string, done?: Function ): void;
  public pong( message?: any, done?: Function ): void {
    if ( typeof message === 'function' ) {
      done = message;
      message = null;
    }

    message = message || this.server.host;

    if ( !this.socket || this.disconnected() ) {
        this.pong_timer && this.pong_timer.stop();
    }

    this.send( `PONG ${ message }` );

    if ( done )
      done();
  }

  /**
  * Send a CAP LIST to the IRC server
  * @return <void>
  */
  private sendCapLs(): void {
    this.send( 'CAP LS 302' );
  }

  /**
  * Send a CAP REQ to the IRC server
  * @param <string> capabilities: The capabilities to request from the Server
  * @return <void>
  */
  public sendCapReq( capabilities: string = '' ): void {
    this.send( `CAP REQ :${ capabilities }` );
  }

  /**
  * End the CAP negotiations
  * @return <void>
  */
  public sendCapEnd(): void {
    this.send( 'CAP END' );
  }

  private setupListeners(): void {
    this.network.bot.on( `registered::${ this.network.name }`, this.onRegistered.bind( this ));
  }

  /**
  * Send login information to the IRC server
  * @return <void>
  */
  private sendLogin(): void {
    let password = this.server.password || this.network.password;
    if ( password )
      this.send( `PASS ${ password }` );

    this.nick = this.network.generate_nick()

    this.send( `NICK ${ this.nick }` );
    this.send( `USER ${ this.network.user_name } ${ ( _.include( this.network.modes, 'i' ) ? '8' : '0' ) }" * :${ this.network.real_name }` );
  }
}

interface IIrcConnection extends IConnection {
  reconnect_attempts: number;
}

interface IrcConnectionOptions {
  ping_delay?: number;
}
