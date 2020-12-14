import { Channel, IChannelOptions, IChannel } from '../base/channel';
import { Slack } from './slack';

export class SlackChannel extends Channel<Slack> implements ISlackChannel {
  constructor(network: Slack, options: ISlackChannelOptions) {
    super(network, options);
  }

  public action(): void {}
  public dispose(): void {}

  public notice(): void {}

  public say(): void {}

  public send(): void {}
}

export interface ISlackChannel extends ISlackChannelOptions, IChannel<Slack> {}

export interface ISlackChannelOptions extends IChannelOptions {}
