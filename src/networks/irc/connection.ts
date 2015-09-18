
import { Socket } from 'net';
import { Server } from './server';
import { IRC } from './irc';
import { Bot } from '../../bot';
import * as tls  from 'tls';
import * as _ from 'lodash';
import { ITimer } from '../../utilities/timer';
import * as Hook from '../../utilities/hook';

export class Connection {

  public socket: Socket | tls.TLSSocket = new Socket();
  public reconnect_attempts = 0;
  public request_disconnect = false;

  private bot: Bot;
  private write_buffer: string[] = [];
  private _connected = false;
  private writing_buffer = false;
  private timer: ITimer;
  private reconnect_delay: number = 1000;

  constructor( public network: IRC, public server: Server ) {
    this.bot = this.network.bot;
  }

  public connect(): void {
    if ( this.connected() ) {
      this.network.bot.emit('already connected', this.network, this.server );
      return;
    }

    Hook.pre( 'connect', this );

    var socket_connect_event = 'connect';

    if ( this.server.ssl ){

      // socket does nothing when this is called
      // this.socket = new tls.TLSSocket( this.socket, {
      //   isServer: false,
      //   rejectUnauthorized: this.network.reject_invalid_certs
      // });

      this.socket = tls.connect( {
        rejectUnauthorized: this.network.reject_invalid_certs,
        host: this.server.host,
        port: this.server.port,
        socket: this.socket
      } );

      socket_connect_event = 'secureConnect';
    }

    this.socket.connect( this.server.port, this.server.host );

    this.socket.on( socket_connect_event, this.connectionSetup.bind( this ) )
      .on( 'error', this.onError.bind( this ) );

  }

  private connectionSetup(): void {
    console.log( this );


    var that = this;

    this.bot.emit( 'connect', this.network, this.server );

    this._connected = true;

    this.socket.setEncoding( this.network.encoding );


    this.send_cap_ls();
    this.send_cap_end();
    this.send_login();

    this.timer = new this.network.Timer( this.network,
      {
        interval: 120000,
        autoStart: true,
        blocking: false,
        ignoreErrors: true,
        immediate: true,
        emitLevel: 0,
        reference: 'pong ' + this.network.name,
        stopOn: 'disconnect ' + this.network.name,
        restartOn: 'registered ' + this.network.name
    }, this.pong.bind( this ) );

    this.socket.on( 'data', this.onData.bind( this ) );
    this.socket.on( 'end', this.onEnd.bind( this ) );
    this.socket.on( 'close', this.onClose.bind( this ) );

    Hook.post( 'connect', this );

    this.bot.emit( 'registered ' + this.network.name , this.network );
  }

  public disconnect( message: string = this.network.quit_message ): void {
    if ( !this.connected() && !this.socket ) { return; }

    if ( this.timer ) { this.timer.stop(); }

    this.send( 'QUIT :' + message );
  }

  public dispose( message?: string ): void {
    if ( this.connected() ) { this.disconnect( message ); }

  }

  /**
  * Are we connected?
  * @return <boolean>
  */
  public connected(): boolean {
    return this._connected;
  }

  public end( data?: string ): void {
    if ( !this.connected() )
      return;

    this.request_disconnect = true;

    this.socket.end();

  }

  // more on this later...
  // TODO utilize buffer
  public send( data: string ): void {
    this.socket.write( data + '\r\n' );
  }

  private onClose( e: any ): void {
    console.log( 'client close', e);
    this.socket.end();
    this._connected = false;
  }

  private onError( e: any ): void {
    switch ( e.code ) {
      case 'ENETUNREACH':
      case 'ETIMEDOUT':
        if ( this.reconnect_attempts < this.network.connection_attempts ) {
          return this.server.disable();
        }

        this.reconnect_attempts++;
        this.reconnect();
        break;
      default: {
        this.bot.Logger.error( 'an unswitched error occurred', e );
      }
    }
  }

  private reconnect(): void {

  }

  private onEnd(): void {
    this._connected = false;

    if ( this.request_disconnect ) {
      // do things to end connection
    } else {
      // do things to reconnect ( should we assume or have a reconnect: boolean setting ?)
    }
  }

  private onTimeout(): void {
  }

  private onData( data: string ): void {
    console.log( 'data ', this.network.name );
    this.parseMessage( data );
  }

  private pong( done?: Function ): void {
    if ( this.socket.destroyed )
      return this.disconnect();

    this.send( 'PONG '+ this.server.host );

    if ( done )
      done();
  }

  private send_cap_ls(): void {
    this.send( 'CAP LS ' );
  }

  // TODO: get network capabilities
  private send_cap_req(): void {
    this.send( 'CAP REQ :' );
  }

  private send_cap_end(): void {
    this.send( 'CAP END' );
  }

  private send_login(): void {
    var password = this.server.password || this.network.password;
    if ( password )
      this.send( "PASS " + password );

    this.send( 'NICK ' + this.network.generate_nick() );
    this.send( 'USER ' + this.network.user + ' ' + ( _.include( this.network.modes, 'i' ) ? '8' : '0' ) + " * :" + this.network.realname  );
  }

  private flushWriteBuffer(): void {

    // if disconnected, reset buffer
    if ( !this.connected() ) {
      return this.bufferReset();
    }


    // buffer is empty
    if ( !this.write_buffer.length ) {
      return this.bufferReset();
    }

  }

  private bufferReset(): void {
    this.write_buffer   = [];
    this.writing_buffer = false;
  }

  private socketSetup( connect_event: string ): void {
    var that = this;
    this.socket.setEncoding( this.network.encoding );


    this.socket.on( connect_event, ()=> {
      that._connected = true;
      that.send_login();
    });

    this.socket.on( 'data', function( data: string ){
      console.log( 'data', that.network.name );
      that.parseMessage.call( that, data );
    });

    this.socket.on( 'ENETUNREACH', function( data: string ) {
      console.log( 'unreachable error' );
      this.network.jump();
    });


    // this.socket.close = (data?:string)=> {
    //   this.socket.end(data);
    //   this.socket.destroy();
    //   this.socket = null;
    // };
  }

  private parseMessage( line: string ): void {
    var parse_regex = /^(?:(?:(?:@([^ ]+) )?):(?:([^\s!]+)|([^\s!]+)!([^\s@]+)@?([^\s]+)?) )?(\S+)(?: (?!:)(.+?))?(?: :(.*))?$/i;

    console.log('line');
    console.log(line);
    var message = parse_regex.exec( line.replace( /^\r+|\r+$/, '' ) );

    console.log('message');

    console.log(message);



  }
}
