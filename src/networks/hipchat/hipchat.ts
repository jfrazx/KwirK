
import { Bot } from '../../bot';
import { Network, INetwork, INetOptions, INetworkOptions } from '../base/network';

export class HipChat extends Network implements IHipChat {

  /**
  * @param <Bot> bot: The bot!!!
  * @param <IHipChatOptions> options: Options for configuring this network type
  */
  constructor( bot: Bot, options: IHipChatOptions ) {
    super( bot, options.name );

  }

}

export interface IHipChat extends HipChatOptions, INetwork {

}

export interface IHipChatOptions extends HipChatOptions, INetOptions {

}

interface HipChatOptions extends INetworkOptions {

}
