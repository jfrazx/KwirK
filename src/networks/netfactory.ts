
import { HipChat, IHipChatOptions } from './hipchat/hipchat';
import { Slack, ISlackOptions } from './slack/slack';
import { Irc, IIrcOptions } from './irc/irc';
import { INetwork, INetworkOptions } from './base/network';
import { Bot } from './../bot';

export module NetFactory {
  export function createNetwork<O extends INetworkOptions>( bot: Bot, options: O  ): AnyNet {

    switch ( options.type ) {
      // case 'gitter':
        // return new Gitter( bot, options );

      case 'hipchat':
        return new HipChat( bot, options );

      case 'irc':
        return new Irc( bot, options );

      case 'slack':
        return new Slack( bot, options );

      default:
        throw new Error( options.type + ' is not a known network type' );

    }
  }
}

export type IAnyNet = IIrcOptions | ISlackOptions | IHipChatOptions;
export type AnyNet = Irc | Slack | HipChat;
