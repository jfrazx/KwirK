
import { Connection, IConnection } from '../base/connection';
import { SlackServer } from './slack_server';
import { Slack } from './slack';
import * as https from 'https';

export class SlackConnection extends Connection implements ISlackConnection {

  constructor( public network: Slack, public server: SlackServer ) {
    super( network, server );
  }

  public connect(): void {

  }

  public dispose(): void {

  }

  public end(): void {

  }
}

interface ISlackConnection extends IConnection {

}
