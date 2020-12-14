import { Connection, IConnection } from '../base/connection';
import { HipChatServer } from './hipchat_server';
import { HipChat } from './hipchat';
import * as https from 'https';

export class HipChatConnection extends Connection<HipChat>
  implements IHipChatConnection {
  constructor(public network: HipChat) {
    super(network);
  }

  public connect(): void {}

  public dispose(): void {}

  public end(): void {}
}

export interface IHipChatConnection extends IConnection<HipChat> {}
