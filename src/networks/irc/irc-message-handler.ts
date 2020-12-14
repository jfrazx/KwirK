import { lineParser, MessageParams } from './irc.line-parser';
import { Message } from '../../messaging/message';
import { IRC as IRCStatus } from '@status/codes';
import { IrcChannel } from './irc_channel';
import { IrcUser } from './irc_user';
import { IRC } from '@status/codes';
import { Irc } from './irc';

import * as moment from 'moment';

export class IrcMessageHandler {
  private static MESSAGE = /^(?:@([^ ]+) )?(?::((?:(?:([^\s!@]+)(?:!([^\s@]+))?)@)?(\S+)) )?((?:[a-zA-Z]+)|(?:[0-9]{3}))(?: ([^:].*?))?(?: :(.*))?$/i;
  public static CTCP = /^(\u0001)(.*)(\u0001)$/;

  constructor(public network: Irc) {
    this.network.bot.on(`parse_message::${this.network.name}`, (line) => {
      console.log(`message handler line received: f${line}f`);
      this.parseMessage(line.trim());
    });
  }

  private parseMessage(line: string): void {
    const params = lineParser(line) as IRCMessage;

    console.log(`params: ${params}`);

    if (!params) {
      return;
    }

    this.logger.info(
      `[${moment(new Date()).format('YYYY-MM-DD HH:mm:ss')}] >> ${line}`,
    );

    params.network = this.network;

    try {
      const command = parseInt(params.command).toString() || params.command;
      const m = this.defineMessage(params);
      const emission = this.createEmitter(params, command as IRC);

      this.network.bot.emit(emission, m ? m : params);
    } catch (e) {
      this.network.bot.emit('error', {
        error: e,
        message: params,
      });
    }
  }

  private createEmitter(params: IRCMessage, command: IRCStatus): string {
    return (IRCStatus as any)[command] === void 0
      ? `${params.command.toString().toUpperCase()}::${this.network.name}`
      : `${(IRCStatus as any)[command]}::${this.network.name}`;
  }

  /**
   * Construct a message to send to the message router
   * @param <any> message: The message starting point
   * @return <void>
   */
  private defineMessage(message: IRCMessage): Message<Irc> {
    message.channel = this.network.channel[message.params[0].toLowerCase()];
    message.user = <IrcUser>this.network.findUser(message.nick);
    message.target = message.channel || message.user;

    if (!message.target) {
      return;
    }

    message.message = message.params[1];

    // match ctcp
    const match = IrcMessageHandler.CTCP.exec(message.params[1]);

    if (match && message.target === message.user) {
      // we don't want it to match action
      if (!this.isAction(message)) {
        this.handleCTCP(message, match);
        return;
      }
    }

    console.log('got message', message);

    const msg = new Message<Irc>(message);

    console.log('after message', message);

    /**
     * Did this event happen in a channel or as a private message?
     */
    msg.events.push(msg.target === msg.channel ? 'public' : 'private');

    if (msg.command.match(/^NOTICE/i)) {
      msg.events.push('notice');
    } else if (msg.content.substr(1, 6).match(/^ACTION$/)) {
      msg.events.push('action');
      msg.content = msg.content.slice(7).trim();
    } else if (msg.command.match(/^PRIVMSG/i)) {
      msg.events.push('message');
    }
    // this shouldn't happen, but...
    else {
      msg.events.push('unknown');

      this.logger.warn(
        `Unknown IRC event with command ${msg.command} and message ${msg.content}`,
      );
    }

    return msg;
  }

  /**
   * @todo handle VERSION , SOURCE and other CTCP queries
   */
  private handleCTCP(_message: any, match: RegExpExecArray): void {
    console.log('ctcp', match);
  }

  private isAction(message: IRCMessage): boolean {
    return Boolean(message.message.substr(1, 6).match(/^ACTION$/));
  }

  private get logger() {
    return this.network.bot.Logger;
  }
}

interface IRCMessage extends MessageParams {
  network: Irc;
  channel: IrcChannel;
  target: IrcChannel | IrcUser;
  user: IrcUser;
  message: string;
}
