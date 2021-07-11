import { HipChat, IHipChatOptions } from './hipchat/hipchat';
import { INetwork, INetworkOptions } from './interfaces';
import { Slack, ISlackOptions } from './slack/slack';
import { wrapSurrogate, NextHandler } from 'surrogate';
import { Irc, IIrcOptions } from './irc/irc';
import { IBot } from '@kwirk/bot';

interface NetworkConstructor {
  new (bot: IBot, options: INetworkOptions): INetwork;
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
  export function create<O extends INetworkOptions>(bot: IBot, options: O): AnyNet {
    try {
      const net = wrapSurrogate(new NETWORKS[options.type](bot, options));

      net.getSurrogate().registerPreHook('connect', ({ next, instance }: NextHandler<INetwork>) => {
        next.next({
          bail: !instance.enabled(),
        });
      });

      return net as any as AnyNet;
    } catch (error) {
      throw new Error(`${options.type} is not a known network type`);
    }
  }
}

export type IAnyNet = IIrcOptions | ISlackOptions | IHipChatOptions;
export type AnyNet = Irc | Slack | HipChat;
