
import { Bot } from '../../bot';
import { Network, INetwork, INetworkOptions, INetOptions } from '../network';
import * as _ from 'lodash';

export class Slack extends Network implements ISlack {

  /**
  * @param <Bot> bot: The bot!!!
  * @param <ISlackOptions> options: Options for configuring this network type
  */
  constructor( bot: Bot, options: ISlackOptions ) {
    super( bot, options.name );

    _.merge( this, _.omit( options, [ 'type', 'enable' ] ) );

    this._enable = options.enable;
  }

}

export interface ISlack extends SlackOptions, INetwork {

}

export interface ISlackOptions extends SlackOptions, INetOptions {

}

interface SlackOptions extends INetworkOptions {

}
