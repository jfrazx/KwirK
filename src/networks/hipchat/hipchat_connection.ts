import { HipChatServer } from './hipchat_server';
import { IConnection } from '../interfaces';
import { Connection } from '../base';
import { HipChat } from './hipchat';

export class HipChatConnection extends Connection<HipChat> implements IHipChatConnection {
  public server: HipChatServer;

  constructor(public network: HipChat) {
    super(network);
  }

  public connect(): void {}

  public dispose(): void {}

  public end(): void {}
}

export interface IHipChatConnection extends IConnection<HipChat> {}
