
/**
* @TODO: Utilize this as a base for a new <Generic>Channel
*/

import { Channel, IChannelOptions, IChannel } from '../channel';
import { Generic } from './generic_network';

export class GenericChannel extends Channel<Generic> implements IGenericChannel {

  constructor( public network: Generic, options: IGenericChannelOptions ) {
    super( network, options );
  }

  public action(): void {}

  public dispose(): void {}

  public notice(): void {}

  public say(): void {}

  public send(): void {}
}

interface IGenericChannel extends IChannel<Generic>, IGenericChannelOptions {

}

interface IGenericChannelOptions extends IChannelOptions {

}
