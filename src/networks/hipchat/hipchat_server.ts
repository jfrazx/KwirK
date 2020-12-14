import { Server, IServer, IServerOptions } from '../base/server';
import { HipChat } from './hipchat';

export class HipChatServer extends Server<HipChat> implements IHipChatServer {
  constructor(public network: HipChat, options: IHipChatServerOptions) {
    super(network, options.host, null);
  }

  public disable(): void {}

  public dispose(): void {}
}

export interface IHipChatServer
  extends IServer<HipChat>,
    IHipChatServerOptions {}

export interface IHipChatServerOptions extends IServerOptions {}
