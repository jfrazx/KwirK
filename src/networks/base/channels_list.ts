'use strict';

import { Channel } from './channel';
import { Network } from './network';

export class ChannelsList<T extends Channel<N>, N extends Network> implements IChannelsList<T, N> {

  constructor( public network: N, private Channel: { new(network: N, { name: string }): T } ) {

  }
}

export interface IChannelsList<T extends Channel<N>, N extends Network> {

}
