'use strict';

import { Constants } from '../../constants/constants';
import { Message } from '../../messaging/Message';
import { IrcConnection } from './irc_connection';
import { Mixin } from '../../utilities/mixin';
import * as iconv from 'iconv-lite';
import { Irc } from './irc';

export class MessageBuffer {

  private held_data: any;
  private hold_last: boolean;

  /**
  * 1024 bytes is the maximum length of two RFC1459 IRC messages.
  * May need tweaking when IRCv3 message tags are more widespread
  */
  private static MAX_BUFFER = 1024;
  private static REGEXP = /^(?:(?:(?:@([^ ]+) )?):(?:([^\s!]+)|([^\s!]+)!([^\s@]+)@?([^\s]+)?) )?(\S+)(?: (?!:)(.+?))?(?: :(.*))?$/i;

  constructor( public connection: IrcConnection, private encoding: string = 'utf8' ) {
  }

  public encodeStream = iconv.encodeStream;
  public decodeStream = iconv.decodeStream;

  /**
  * Called when the socket receives data
  * @param <Buffer> data: The data received from the socket
  * @return <void>
  */
  public onData( data: Buffer ) {
    // from kiwiIRC
    let data_pos   = 0,               // Current position within the data Buffer
        line_start = 0,
        lines: Buffer[] = [];

    // Split data chunk into individual lines
    for ( ; data_pos < data.length; data_pos++ ) {
      if ( data[ data_pos ] === 0x0A ) { // Check if byte is a line feed
        lines.push( data.slice( line_start, data_pos ) );
        line_start = data_pos + 1;
      }
    }

    // No complete lines of data? Check to see if buffering the data would exceed the max buffer size
    if ( !lines[ 0 ] ) {
      if ( ( this.held_data ? this.held_data.length : 0 ) + data.length > MessageBuffer.MAX_BUFFER ) {
        // Buffering this data would exeed our max buffer size
        this.maxBufferError();

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
      if ( ( data.length - line_start ) > MessageBuffer.MAX_BUFFER ) {
        // Buffering this data would exeed our max buffer size
        return this.maxBufferError();
      }

      this.hold_last = true;
      this.held_data = new Buffer( data.length - line_start );
      data.copy( this.held_data, 0, line_start );
    }

    // Process our data line by line
    for ( let line of lines ) {
      this.parseMessage( this.decode( line, this.encoding ) );
    }
  }

  public decode( message: Buffer, encoding = this.encoding ): string {
    return iconv.decode( message, encoding );
  }

  public encode( message: string, encoding = this.encoding ): Buffer {
    return iconv.encode( message, encoding );
  }

  public setEncoding( encoding: string ): boolean {
    if ( iconv.encodingExists( encoding ) ) {
      this.encoding = encoding;
    }

    return iconv.encodingExists( encoding );
  }

  /**
  * Parse the data received from the server
  * @param <string> line: The line to parse
  * @return <void>
  */
  private parseMessage( line: string ): void {
    if ( !line )
      return;

    line = line.trim();

    let time = new Date();

    console.log( '[' + time.getHours() + ':' + time.getMinutes() + ':' + time.getSeconds() + '] >>', line );

    let message: RegExpExecArray = MessageBuffer.REGEXP.exec( line.replace( /^\r+|\r+$/, '' ) );

    if ( !message ) {
      this.connection.network.bot.Logger.warn( 'Malformed IRC line: %s', line.replace( /^\r+|\r+$/, '' ) );
      return;
    }

    let msg_obj = {
        tags:       this.extractTags( message ),
        prefix:     message[ 2 ],
        nick:       message[ 3 ] || message[ 2 ],  // Nick will be in the prefix slot if a full user mask is not used
        ident:      message[ 4 ] || '',
        hostname:   message[ 5 ] || '',
        command:    message[ 6 ],
        params:     message[ 7 ] ? message[ 7 ].split( / +/ ) : [],
        network:    this.connection.network
    };

    if ( message[ 8 ] ) {
        msg_obj.params.push( message[ 8 ].replace( /\s+$/, '' ) );
    }

    try {
      let command = parseInt( msg_obj.command ).toString() || msg_obj.command;
      let emission = Constants.IRC[ command ] + '::' + this.connection.network.name;

      if ( Constants.IRC[ command ] === undefined )
        emission = `${ msg_obj.command.toString().toUpperCase() }:: ${ this.connection.network.name }`;

      let m = this.defineMessage( msg_obj );

      this.connection.network.bot.emit( emission, (m ? m : msg_obj ) );
    }
    catch ( e ) {
      this.connection.network.bot.emit( 'error', {
        error: e,
        message: msg_obj
      });
    }
  }

  // Extract any tags (message[1])
  private extractTags( message: RegExpExecArray ): ITag[] {
    let tags: ITag[] = [];

    if ( message[ 1 ] ) {
        let temps = message[ 1 ].split( ';' );

        for ( let i = 0; i < temps.length; i++ ) {
          let tag = temps[ i ].split( '=' );
          tags.push({ tag: tag[ 0 ], value: tag[ 1 ] });
        }
    }

    return tags;
  }

  private maxBufferError(): void {
    this.connection.network.bot.emit( 'error', new Error('Message buffer too large') );
    this.connection.socket.destroy();
    this.connection.network.bot.emit( `jump::${ this.connection.network.name }`, 'message buffer overflow' );
  }

  /**
  * Construct a message to send to the message router
  * @param <any> message: The message starting point
  * @return <void>
  */
  private defineMessage( message: any ): Message<Irc> {
    let msg: Message<Irc>,
        match: RegExpExecArray;

    message.channel = this.connection.network.channel[ message.params[ 0 ].toLowerCase() ];
    message.user    = this.connection.network.findUser( message.nick );
    message.target  = message.channel || message.user;

    if ( !message.target ) return;

    message.message = message.params[ 1 ];

    // match ctcp
    match = /^(\u0001)(.*)(\u0001)$/.exec( message.params[ 1 ] );

    if ( match && message.target === message.user ) {
      // we don't want it to match action
      if ( !message.message.substr( 1, 6 ).match( /^ACTION$/ ) ) {
        this.handleCTCP( message, match );
        return;
      }
    }

    msg = new Message<Irc>( message );

    /**
    * Did this event happen in a channel or as a private message?
    */
    msg.events.push( msg.target === msg.channel ? 'public' : 'private' );

    if ( msg.command.match( /^NOTICE/i ))
      msg.events.push( 'notice' );

    else if ( msg.content.substr( 1, 6 ).match( /^ACTION$/ )) {
      msg.events.push( 'action' );
      msg.content = msg.content.slice( 7 ).trim();
    }
    else if ( msg.command.match( /^PRIVMSG/i ))
      msg.events.push( 'message' );

    // this shouldn't happen, but...
    else {
      msg.events.push( 'unknown' );

      this.connection.network.bot.Logger.warn( `Unknown IRC event with command ${ msg.command } and message ${ msg.content }` );
    }

    return msg;
  }

  /**
  * @todo handle VERSION , SOURCE and other CTCP queries
  */
  private handleCTCP( message: any, match: RegExpExecArray ): void {
    console.log( 'ctcp', match );
  }
}

interface ITag {
  tag: string;
  value: string;
}
