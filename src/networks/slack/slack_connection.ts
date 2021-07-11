import { SlackServer } from './slack_server';
import { IConnection } from '../interfaces';
import { Connection } from '../base';
import { Slack } from './slack';

export class SlackConnection extends Connection<Slack> implements ISlackConnection {
  public server: SlackServer;

  constructor(public network: Slack) {
    super(network);
  }

  public connect(): void {}

  public dispose(): void {}

  public end(): void {}
}

export interface ISlackConnection extends IConnection<Slack> {}
