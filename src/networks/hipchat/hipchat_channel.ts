
import { Channel, IChannelOptions, IChannel } from '../base/channel';
import { HipChat } from './hipchat';

export class HipChatChannel extends Channel<HipChat> implements IHipChatChannel {

  constructor( public network: HipChat, options: IHipChatChannelOptions ) {
    super( network, options );
  }

  public dispose(): void {

  }

  public action(): void {

  }

  public say(): void {

  }

  public notice(): void {

  }

  public send(): void {

  }
}

interface IHipChatChannel extends IHipChatChannelOptions, IChannel<HipChat> {

}

interface IHipChatChannelOptions extends IChannelOptions {

}
