import { INetwork, INetworkOptions, INetOptions } from '../interfaces';
import { SlackConnection } from './slack_connection';
import { SlackUser } from './slack_user';
import { Options } from '@kwirk/options';
import { Network } from '../base';
import { IBot } from '@kwirk/bot';
import * as _ from 'lodash';

export class Slack extends Network<ISlack, ISlackOptions> implements ISlack {
  public connection: SlackConnection;

  constructor(bot: IBot, public options: Options<ISlackOptions>) {
    super(bot, options);
  }

  public connect(): void {}

  public disconnect(): void;
  public disconnect(callback: Function): void;
  public disconnect(message: string): void;
  public disconnect(message: string, callback: Function): void;
  public disconnect(message?: any, callback?: Function): void {}

  public send(message: string): void {}

  public addUser(): SlackUser {
    return;
  }
}

export interface ISlack extends INetwork {}

export interface ISlackOptions extends SlackOptions, INetOptions {}

export interface SlackOptions extends INetworkOptions {}
