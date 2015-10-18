
import { Server, IServer, IServerOptions } from '../base/server';
import { HipChat } from './hipchat';

export class HipChatServer extends Server implements IHipChatServer {

  constructor( public network: HipChat, options: IHipChatServerOptions ) {
    super( network, options.host, null );
  }

  public disable(): void {

  }

  public dispose(): void {

  }

}

interface IHipChatServer extends IServer, IHipChatServerOptions {

}

interface IHipChatServerOptions extends IServerOptions {

}
