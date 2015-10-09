
import { Network, INetwork, INetworkOptions, INetOptions } from '../base/network';
import { SlackUser } from './slack_user';
import { Bot } from '../../bot';
import * as _ from 'lodash';

export class Slack extends Network implements ISlack {

  /**
  * @param <Bot> bot: The bot!!!
  * @param <ISlackOptions> options: Options for configuring this network type
  */
  constructor( bot: Bot, options: ISlackOptions ) {
    super( bot, options );

    _.merge( this, _.omit( options, [ 'enable', 'name' ] ) );

  }

  public connect(): void {

  }

  public disconnect(): void {

  }

  public send( message: string ): void {

  }

  public addUser(): SlackUser {
    return;
  }

}

export interface ISlack extends SlackOptions, INetwork {

}

export interface ISlackOptions extends SlackOptions, INetOptions {

}

interface SlackOptions extends INetworkOptions {

}
