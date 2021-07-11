import { INetwork, INetOptions, INetworkOptions } from '../interfaces';
import { HipChatUser } from './hipchat_user';
import { Options } from '@kwirk/options';
import { Connection, Network } from '../base';
import { IBot } from '@kwirk/bot';
import * as _ from 'lodash';

export class HipChat extends Network<IHipChat, HipChatOptions> implements IHipChat {
  connection: Connection<Network<IHipChat, HipChatOptions>>;

  constructor(bot: IBot, options: Options<IHipChatOptions>) {
    super(bot, options);

    _.merge(this, _.omit(options, ['enable', 'name']));
  }

  /**
   * Connect to HipChat servers
   * @return <void>
   */
  public connect(): void {
    // do connection activities for specific network type
  }

  public disconnect(): void;
  public disconnect(callback: Function): void;
  public disconnect(message: string): void;
  public disconnect(message: string, callback: Function): void;
  public disconnect(message?: any, callback?: Function): void {}

  public send(message: string): void {}

  public addUser(): HipChatUser {
    return;
  }
}

export interface IHipChat extends INetwork {}

export interface IHipChatOptions extends HipChatOptions, INetOptions {}

export interface HipChatOptions extends INetworkOptions {}
