
import { Server, IServer, IServerOptions } from '../base/server';
import { Slack } from './slack';

export class SlackServer extends Server<Slack> implements ISlackServer {

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

export interface ISlackServer extends IServer<Slack>, ISlackServerOptions {

}

export interface ISlackServerOptions extends IServerOptions {

}
