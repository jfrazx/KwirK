
import { HipChat, IHipChatOptions } from './hipchat/hipchat';
import { Slack, ISlackOptions } from './slack/slack';
import { Irc, IIrcOptions } from './irc/irc';
import { Network, INetwork, INetworkOptions } from './base/network';
import { Hook } from '../utilities/hooks';
import { Bot } from './../bot';

export namespace NetFactory {

  /**
   * Create a network instance of the given type
   *
   * @export
   * @template O
   * @param {Bot} bot
   * @param {O} options
   * @returns {AnyNet}
   */
  export function createNetwork<O extends INetworkOptions>(bot: Bot, options: O): AnyNet {
    let network: AnyNet;

    switch (options.type) {
      // case 'gitter':
        // network = new Gitter( bot, options );

      case 'hipchat':
        network = new HipChat(bot, options);
        break;
      case 'irc':
        network = new Irc(bot, options);
        break;
      case 'slack':
        network = new Slack(bot, options);
        break;
      default:
        throw new Error(`${ options.type } is not a known network type`);
    }

    return new Proxy(network, new Hook<AnyNet>());
    // return network;
  }
}

export type IAnyNet = IIrcOptions | ISlackOptions | IHipChatOptions;
// export type AnyNet = typeof Network;
// export type AnyNet = "ANYTHING THAT EXTENDS NETWORK"
export type AnyNet = Irc | Slack | HipChat;
