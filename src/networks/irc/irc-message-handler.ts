import { Constants } from '../../constants/constants';
import { Message } from '../../messaging/message';
import { Irc } from './irc';

import * as moment from 'moment';

export class IrcMessageHandler {
  private static MESSAGE = /^(?:(?:(?:@([^ ]+) )?):(?:([^\s!]+)|([^\s!]+)!([^\s@]+)@?([^\s]+)?) )?(\S+)(?: (?!:)(.+?))?(?: :(.*))?$/i;
  public static CTCP     = /^(\u0001)(.*)(\u0001)$/;

  constructor(public network: Irc) {
    this.network.bot.on(`parse_message::${ this.network.name }`, line => {
      this.parseMessage(line);
    });
  }

  private parseMessage( line: string ): void {
    if ( !line ) return;

    line = line.trim();

    const time = new Date();

    this.logger.info(`[${ moment(time).format('YYYY-MM-DD HH:mm:ss') }] >> ${ line }`);

    const message: RegExpExecArray = IrcMessageHandler.MESSAGE.exec(line.replace(/^\r+|\r+$/, ''));

    if (!message) {
      this.logger.warn(`Malformed IRC line: ${ line.replace(/^\r+|\r+$/, '') }`);
      return;
    }

    const msg_obj = {
        tags:       this.extractTags(message),
        prefix:     message[2],
        nick:       message[3] || message[2],  // Nick will be in the prefix slot if a full user mask is not used
        ident:      message[4] || '',
        hostname:   message[5] || '',
        command:    message[6],
        params:     message[7] ? message[7].split(/ +/) : [],
        network:    this.network
    };

    if (message[8]) {
        msg_obj.params.push(message[8].replace(/\s+$/, ''));
    }

    try {
      const command = parseInt(msg_obj.command).toString() || msg_obj.command;
      const m = this.defineMessage(msg_obj);
      const emission = (Constants.IRC[command] === void 0) ?
                          `${ msg_obj.command.toString().toUpperCase() }::${ this.network.name }` :
                          `${ Constants.IRC[command] }::${ this.network.name }`;


      this.network.bot.emit(emission, (m ? m : msg_obj));
    }
    catch (e) {
      this.network.bot.emit('error', {
        error: e,
        message: msg_obj
      });
    }
  }

    /**
  * Construct a message to send to the message router
  * @param <any> message: The message starting point
  * @return <void>
  */
  private defineMessage(message: any): Message<Irc> {
    let msg: Message<Irc>,
        match: RegExpExecArray;

    message.channel = this.network.channel[message.params[0].toLowerCase()];
    message.user    = this.network.findUser(message.nick);
    message.target  = message.channel || message.user;

    if (!message.target) return;

    message.message = message.params[1];

    // match ctcp
    match = IrcMessageHandler.CTCP.exec(message.params[1]);

    if (match && message.target === message.user) {
      // we don't want it to match action
      if (!message.message.substr(1, 6).match(/^ACTION$/)) {
        this.handleCTCP( message, match );
        return;
      }
    }

    console.log('got message', message);

    msg = new Message<Irc>(message);

    console.log('after message', message);

    /**
    * Did this event happen in a channel or as a private message?
    */
    msg.events.push(msg.target === msg.channel ? 'public' : 'private');

    if (msg.command.match(/^NOTICE/i)) {
      msg.events.push('notice');
    }
    else if (msg.content.substr(1, 6).match(/^ACTION$/)) {
      msg.events.push('action');
      msg.content = msg.content.slice(7).trim();
    }
    else if (msg.command.match(/^PRIVMSG/i)) {
      msg.events.push('message');
    }
    // this shouldn't happen, but...
    else {
      msg.events.push('unknown');

      this.logger.warn(`Unknown IRC event with command ${ msg.command } and message ${ msg.content }`);
    }

    return msg;
  }

  /**
  * @todo handle VERSION , SOURCE and other CTCP queries
  */
  private handleCTCP( message: any, match: RegExpExecArray ): void {
    console.log('ctcp', match);
  }


  /**
   *
   *
   * @private
   * @param {RegExpExecArray} message
   * @returns {ITag[]}
   * @memberof IrcMessageHandler
   */
  private extractTags(message: RegExpExecArray): ITag[] {
    const tags: ITag[] = [];

    if (message[1]) {
      const temps = message[1].split(';');

      for (let i = 0; i < temps.length; i++) {
        const tag = temps[i].split('=');
        tags.push({ tag: tag[0], value: tag[1] });
      }
    }

    return tags;
  }

  private get logger() {
    return this.network.bot.Logger;
  }
}

interface ITag {
  tag: string;
  value: string;
}
