import { IChannel, INetwork } from '../interfaces';
import { Channel } from './channel';
import { Network } from './network';

export class ChannelsList<N extends INetwork, T extends IChannel<N>>
  implements IChannelsList<N, T>
{
  constructor(
    public network: N,
    private Channel: { new (network: N, options: { name: string }): T },
  ) {}
}

export interface IChannelsList<N, T> {}
