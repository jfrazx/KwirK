import { HipChat, IHipChatOptions } from './hipchat/hipchat';
import { INetwork, INetworkOptions } from './base/network';
import { Slack, ISlackOptions } from './slack/slack';
import { wrapSurrogate, INext } from 'surrogate';
import { Irc, IIrcOptions } from './irc/irc';
import { Bot } from '../bot';

interface NetworkConstructor {
  new (bot: Bot, options: INetworkOptions): INetwork;
}

interface NetworkMap {
  [key: string]: NetworkConstructor;
}

const NETWORKS: NetworkMap = {
  irc: Irc,
  hipchat: HipChat,
  slack: Slack,
};

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
  export function create<O extends INetworkOptions>(bot: Bot, options: O): AnyNet {
    try {
      const net = wrapSurrogate(new NETWORKS[options.type](bot, options));

      net.getSurrogate().registerPreHook('connect', (next: INext<INetwork>) => {
        const { instance } = next;

        next.next({
          bail: !instance.enabled(),
        });
      });

      return (net as any) as AnyNet;
    } catch (error) {
      throw new Error(`${options.type} is not a known network type`);
    }
  }
}

export type IAnyNet = IIrcOptions | ISlackOptions | IHipChatOptions;
export type AnyNet = Irc | Slack | HipChat;
