
import { Server, IServer, IServerOptions } from '../base/server';
import { Slack } from './slack';

export class SlackServer extends Server implements ISlackServer {

  constructor( public network: Slack, options: ISlackServerOptions ) {
    super( network, options.host, null );
  }

  public disable(): void {

  }

  public dispose(): void {

  }

  private defaults(): ISlackServerOptions {
    return {
      host: 'api.slack.com'
    };
  }

}

interface ISlackServer extends IServer, ISlackServerOptions {

}

interface ISlackServerOptions extends IServerOptions {

}
