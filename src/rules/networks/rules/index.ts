import { INetworkOptions, INetwork } from '@kwirk/networks';
import { NetworkHandlerRule } from '../base';
import { Options } from '@kwirk/options';
import { IBot } from '@kwirk/bot';

export interface NetworkRuleConstructor<T extends INetwork, O extends INetworkOptions> {
  type: string;
  new (bot: IBot, options: Options<O>): NetworkHandlerRule<T, O>;
}

export * from './irc';
export * from './slack';
export * from './notFound';
