
import { Channel, IChannelOptions, IChannel } from '../base/channel';
import { Slack } from './slack';

export class SlackChannel extends Channel implements ISlackChannel {


  constructor( network: Slack, options: ISlackChannelOptions ) {
    super( network, options );
  }

  public action(): void {

  }
  public dispose(): void {

  }

  public notice(): void {

  }

  public say(): void {

  }

  public send(): void {

  }
}

interface ISlackChannel extends ISlackChannelOptions, IChannel {

}

interface ISlackChannelOptions extends IChannelOptions {

}
