import { INetwork } from './network.interface';
import { ITarget } from './target.interface';

export interface IChannel<N extends INetwork> extends IChannelOptions, ITarget {
  network: N;
}

export interface IChannelOptions {
  name: string;
}
