import { IChannelOptions, IChannel } from '../interfaces';
import { HipChat } from './hipchat';
import { Channel } from '../base';

export class HipChatChannel extends Channel<HipChat> implements IHipChatChannel {
  constructor(public network: HipChat, options: IHipChatChannelOptions) {
    super(network, options);
  }

  public dispose(): void {}

  public action(): void {}

  public say(): void {}

  public notice(): void {}

  public send(): void {}
}

export interface IHipChatChannel extends IHipChatChannelOptions, IChannel<HipChat> {}

export interface IHipChatChannelOptions extends IChannelOptions {}
