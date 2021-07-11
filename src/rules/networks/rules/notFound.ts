import { INetworkOptions } from '@kwirk/networks';
import { NetworkHandlerRule } from '../base';

export class NetworkNotFound<O extends INetworkOptions> extends NetworkHandlerRule<never, O> {
  shouldHandle(): boolean {
    return true;
  }

  public handle(): never {
    throw new Error(`Network type '${this.options.type}' not found`);
  }
}
