

import { Bot } from '../../bot';
import { Connection } from '../base/connection';

import { Socket } from 'net';
import { IrcServer } from './irc_server';
import { IRC } from './irc';
import * as tls  from 'tls';
import * as _ from 'lodash';
import { ITimer } from '../../utilities/timer';
import * as Hook from '../../utilities/hook';
import { Constants } from '../../constants';
import { Handler } from './handler';

export class IrcConnection extends Connection {

  public reconnect_attempts = 0;
  public request_disconnect: boolean;
  public capabilities: { requested: string[], enabled: string[] } = { requested: [], enabled: [] };
  public registered: boolean;

  private reconnect_timer: ITimer;
  private held_data: any;
  private hold_last: boolean;
  private handler: Handler;

  constructor( public network: IRC, public server: IrcServer ) {
    super( network, server );

    this.handler = new Handler( this.network );
  }

  public connect(): void {
    if ( this.connected() ) {
      this.network.bot.emit( 'already connected', this.network, this.server );
      return;
    }

    this.request_disconnect = false;
    this.registered = false;

    Hook.pre( 'connect', this );

    var socket_connect_event = 'connect';

    if ( this.server.ssl ){

      this.socket = tls.connect( {
        rejectUnauthorized: this.network.reject_invalid_certs,
        host: this.server.host,
        port: this.server.port
      } );

      socket_connect_event = 'secureConnect';
    } else {
      this.socket = new Socket();
      this.socket.connect( this.server.port, this.server.host );
    }

    this.socket.on( socket_connect_event, this.connectionSetup.bind( this ) )
      .on( 'error', this.onError.bind( this ) );
  }

  private connectionSetup(): void {
    this.pipeSetup();

    this._connected = true;

    this.send_cap_ls();

    this.send_login();

    this.socket.on( 'data', this.onData.bind( this ) );
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
  public disconnect( message?: string ): void {
    if ( !this.connected() && !this.socket ) { return; }

    if ( message === undefined )
      message = this.network.quit_message;

    this.request_disconnect = true;

    this.send( 'QUIT : ' + message );

    process.nextTick( this.end.bind( this ) );
  }

  public dispose(): void {
    if ( this.connected() )
      this.disconnect();

    if ( this.reconnect_timer )
      this.reconnect_timer.stop();

    if ( this.socket )
      this.end();

    _.each( this.network.users, ( user ) => {
      user.dispose();
    });

    _.each( _.keys( this.network.channel ), ( name ) => {
      this.network.channel[ name ].dispose();
    });

    this.network.users = [];
    this.network.channel = {};

    this.server.dispose();
    this.server = null;
  }

  /**
  * Called when the socket receives data
  * @param <Buffer> data: The data received from the socket
  * @return <void>
  * @private
  */
  private onData( data: Buffer ) {
    // from kiwiIRC
    var data_pos: number,               // Current position within the data Buffer
        line_start = 0,
        lines: Buffer[] = [],
        max_buffer_size = 1024; // 1024 bytes is the maximum length of two RFC1459 IRC messages.
                                // May need tweaking when IRCv3 message tags are more widespread

    // Split data chunk into individual lines
    for ( data_pos = 0; data_pos < data.length; data_pos++ ) {
        if ( data[ data_pos ] === 0x0A ) { // Check if byte is a line feed
            lines.push( data.slice( line_start, data_pos ) );
            line_start = data_pos + 1;
        }
    }

    // No complete lines of data? Check to see if buffering the data would exceed the max buffer size
    if ( !lines[ 0 ] ) {
        if ( ( this.held_data ? this.held_data.length : 0 ) + data.length > max_buffer_size ) {
            // Buffering this data would exeed our max buffer size
            this.network.bot.emit( 'error', 'Message buffer too large' );
            this.socket.destroy();

        } else {

            // Append the incomplete line to our held_data and wait for more
            if ( this.held_data ) {
                this.held_data = Buffer.concat( [ this.held_data, data ], this.held_data.length + data.length );
            } else {
                this.held_data = data;
            }
        }

        // No complete lines to process..
        return;
    }

    // If we have an incomplete line held from the previous chunk of data
    // merge it with the first line from this chunk of data
    if ( this.hold_last && this.held_data !== null ) {
        lines[ 0 ] = Buffer.concat( [ this.held_data, lines[ 0 ] ], this.held_data.length + lines[ 0 ].length );
        this.hold_last = false;
        this.held_data = null;
    }

    // If the last line of data in this chunk is not complete, hold it so
    // it can be merged with the first line from the next chunk
    if ( line_start < data_pos ) {
        if ( ( data.length - line_start ) > max_buffer_size ) {
            // Buffering this data would exeed our max buffer size
            this.network.bot.emit( 'error', 'Message buffer too large' );
            this.socket.destroy();
            return;
        }

        this.hold_last = true;
        this.held_data = new Buffer( data.length - line_start );
        data.copy( this.held_data, 0, line_start );
    }

    // Process our data line by line
    for ( let i = 0; i < lines.length; i++ ) {
      this.parseMessage( lines[ i ].toString( this.network.encoding ) );
    }
  }

  public end(): void {
    this.disposeSocket();
    this.network.clearTimers();
    this.buffer.unpipe( this.socket );
  }

  // more on this later...
  public send( data: string ): void {
    if ( this.connected() && this.socket )
      // this.socket.write( data + '\r\n' );
      this.buffer.push( data + '\r\n' );
  }

  /**
  * Called when the socket connection is closed
  * @param <boolean> error: Did the socket connection close because of an error?
  * @return <void>
  */
  private onClose( error: boolean ): void {

    this._connected = false;
    this.registered = false;

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

    switch ( e.code ) {
      case 'EPIPE':

        if ( !this.request_disconnect )
          return this.reconnect();

        break;
      case 'ENETUNREACH':
        return this.server.disable();

      case 'ETIMEDOUT':
        if ( this.reconnect_attempts < this.network.connection_attempts ) {
          this.server.disable();
          this.reconnect_attempts = 0;
          return this.network.jump();
        }

        this.reconnect_attempts++;
        this.reconnect();
        break;
      case 'ECONNRESET':

        break;
      default: {
        this.network.bot.Logger.error( 'an unswitched error occurred', e );
      }
    }
  }

  /**
  * Setup the reconnect timer to delay reconnection to the current server
  * @return <void>
  */
  private reconnect(): void {
    this.reconnect_delay = this.reconnect_delay * this.reconnect_attempts || this.reconnect_delay;

    this.network.bot.Logger.info( 'setting timer to delay ' + this.server.host + ' reconnection for ' + ( this.reconnect_delay / 1000 ).toString() + ' seconds on network ' + this.network.name );

    if ( this.reconnect_timer )

      this.reconnect_timer.interval = this.reconnect_delay;

    else
      this.reconnect_timer = this.network.Timer( {
        infinite: false,
        interval: this.reconnect_delay,
        reference: 'reconnect timer ' + this.network.name,
      }, this.connect.bind( this ) );

    this.reconnect_timer.start();
  }

  /**
  * What to do after a successful registration
  * @return <void>
  */
  private onRegistered( network: IRC ): void {
    this.registered = true;

    Hook.post( 'connect', this.network );
  }

  private onEnd(): void {
    this._connected = false;

    if ( this.request_disconnect ) {
      // do things to end connection
    } else {
      // do things to reconnect ( should we assume or have a reconnect: boolean setting ?)
    }
  }

  /**
  * Sends a PONG message to the IRC server
  * @param <string> message: the message to include
  * @return <void>
  */
  public pong( message?: string ): void {
    if ( this.socket.destroyed )
      return this.disposeSocket();

    this.send( 'PONG '+ ( message ? message : this.server.host ) );
  }

  /**
  * Send a CAP LIST to the IRC server
  * @return <void>
  */
  private send_cap_ls(): void {
    this.send( 'CAP LS 302' );
  }

  // TODO: get network capabilities
  public send_cap_req( capabilities?: string ): void {
    this.send( 'CAP REQ :' + capabilities );
  }

  /**
  * End the CAP negotiations
  * @return <void>
  */
  public send_cap_end(): void {
    this.send( 'CAP END' );
  }

  /**
  * Send login information to the IRC server
  * @return <void>
  */
  private send_login(): void {
    var password = this.server.password || this.network.password;
    if ( password )
      this.send( "PASS " + password );

    this.send( 'NICK ' + this.network.generate_nick() );
    this.send( 'USER ' + this.network.user + ' ' + ( _.include( this.network.modes, 'i' ) ? '8' : '0' ) + " * :" + this.network.realname  );
  }


  /**
  * Parse the data received from the server
  * @param <string> line: The line to parse
  * @return <void>
  */
  private parseMessage( line: string ): void {
    console.log( line );
    var tags: any[] = [];

    if ( !line )
      return;

    line = line.trim();

    var parse_regex = /^(?:(?:(?:@([^ ]+) )?):(?:([^\s!]+)|([^\s!]+)!([^\s@]+)@?([^\s]+)?) )?(\S+)(?: (?!:)(.+?))?(?: :(.*))?$/i;

    var message = parse_regex.exec( line.replace( /^\r+|\r+$/, '' ) );

    if ( !message ) {
      this.network.bot.Logger.warn( 'Malformed IRC line: %s', line.replace( /^\r+|\r+$/, '' ) );
      return;
    }

    // Extract any tags (message[1])
    if ( message[ 1 ] ) {
        tags = message[ 1 ].split( ';' );

        for ( let i = 0; i < tags.length; i++ ) {
            let tag = tags[ i ].split( '=' );
            tags[ i ] = { tag: tag[ 0 ], value: tag[ 1 ] };
        }
    }

    var msg_obj = {
        tags:       tags,
        prefix:     message[ 2 ],
        nick:       message[ 3 ] || message[ 2 ],  // Nick will be in the prefix slot if a full user mask is not used
        ident:      message[ 4 ] || '',
        hostname:   message[ 5 ] || '',
        command:    message[ 6 ],
        params:     message[ 7 ] ? message[ 7 ].split( / +/ ) : [],
        network:    this.network
    };

    if ( message[ 8 ] ) {
        msg_obj.params.push( message[ 8 ].replace( /\s+$/, '' ) );
    }

    try {
      let command = parseInt( msg_obj.command ) || msg_obj.command;
      let emission = Constants.IRC[ command ] + '::' + this.network.name;

      if ( Constants.IRC[ command ] === undefined )
        emission = command.toString().toUpperCase() + '::' + this.network.name;

      this.network.bot.emit( emission, msg_obj );
    }
    catch ( e ) {
      this.network.bot.Logger.error( 'An error occured', e );
      this.network.bot.emit('error::'+ this.network.name, {
        error: e,
        message: msg_obj
      } );
    }
  }
}
