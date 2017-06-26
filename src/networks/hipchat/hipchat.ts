
import { Network, INetwork, INetOptions, INetworkOptions } from '../base/network';
import { HipChatUser } from './hipchat_user';
import { Bot } from '../../bot';
import * as _ from 'lodash';

export class HipChat extends Network implements IHipChat {

  /**
  * @param <Bot> bot: The bot!!!
  * @param <IHipChatOptions> options: Options for configuring this network type
  */
  constructor( bot: Bot, options: IHipChatOptions ) {
    super( bot, options );

    _.merge( this, _.omit( options, [ 'enable', 'name' ] ) );
  }

  /**
  * Connect to HipChat servers
  * @return <void>
  */
  public connect(): void {
    // do connection activities for specific network type
  }

  public disconnect(): void;
  public disconnect( callback: Function ): void;
  public disconnect( message: string ): void;
  public disconnect( message: string, callback: Function ): void;
  public disconnect( message?: any, callback?: Function ): void {
  }

  public send( message: string ): void {

  }

  public addUser(): HipChatUser {
    return;
  }
}

export interface IHipChat extends HipChatOptions, INetwork {

}

export interface IHipChatOptions extends HipChatOptions, INetOptions {

}

export interface HipChatOptions extends INetworkOptions {

}
