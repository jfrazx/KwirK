import { NetworkRuleConstructor, NetworkNotFound } from '../rules';
import { INetwork, INetworkOptions } from '@kwirk/networks';
import { Abstract } from '@status/abstract';
import { Handle } from '@kwirk/interfaces';
import { IBot } from '@kwirk/bot';

@Abstract
export abstract class NetworkRuleRunner {
  private static rules: NetworkRuleConstructor<any, any>[] = [];

  static register<T extends INetwork, O extends INetworkOptions>(network: NetworkRuleConstructor<T, O>) {
    const initialLength = this.rules.length;
    const rules = this.rules.filter((rule) => rule.type !== network.type);

    this.rules = [...rules, network];

    if (this.rules.length === initialLength) {
      console.warn(`Warning: '${network.type}' Handler Rule has been replaced`);
    }
  }

  static create<T extends INetwork, O extends INetworkOptions>(bot: IBot, networkOptions: O): T {
    return this.findRule<T, O>(bot, networkOptions).handle();
  }

  private static findRule<T extends INetwork, O extends INetworkOptions>(
    bot: IBot,
    networkOptions: O,
  ): Handle<T> {
    return [...this.rules, NetworkNotFound]
      .map((Rule) => new Rule(bot, networkOptions))
      .find((rule) => rule.shouldHandle());
  }
}

export interface NetworkRuleRunner {
  register<T extends INetwork, O extends INetworkOptions>(network: NetworkRuleConstructor<T, O>): void;
}
