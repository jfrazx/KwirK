'use strict';

import { Channel } from './channel';
import { Network } from './network';

export class ChannelsList<N extends Network, T extends Channel<N>> implements IChannelsList<N, T> {

  constructor(public network: N, private Channel: { new(network: N, options: { name: string }): T }) {

  }
}

export interface IChannelsList<N, T> {

}
