
import { Bot } from './../bot';
import { IRC, IIrcOptions } from './irc/irc';
import { Slack, ISlackOptions } from './slack/slack';
import { HipChat, IHipChatOptions } from './hipchat/hipchat';

export class NetFactory {

  static createNetwork ( bot: Bot, net: IAnyNet ): AnyNet {

    switch ( net.type ) {
      case 'hipchat':
        return new HipChat( bot, net );

      case 'irc':
        return new IRC( bot, net );

      case 'slack':
        return new Slack( bot, net );

      default:
        throw new Error( net.type + ' is not a known network type' );

    }
  }
}

export type AnyNet = IRC | Slack | HipChat;
export type IAnyNet = IIrcOptions | ISlackOptions | IHipChatOptions;
