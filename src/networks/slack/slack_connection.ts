
import { Connection, IConnection } from '../base/connection';
import { SlackServer } from './slack_server';
import { Slack } from './slack';
import * as https from 'https';

export class SlackConnection extends Connection<Slack> implements ISlackConnection {

  constructor( public network: Slack ) {
    super( network );
  }

  public connect(): void {

  }

  public dispose(): void {

  }

  public end(): void {

  }
}

interface ISlackConnection extends IConnection<Slack> {

}
