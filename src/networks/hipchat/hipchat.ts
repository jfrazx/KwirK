
import { Network, INetwork, INetOptions, INetworkOptions } from '../base/network';
import { HipChatUser } from './hipchat_user';
import { Bot } from '../../bot';

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

  }

  public disconnect(): void {

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

interface HipChatOptions extends INetworkOptions {

}
