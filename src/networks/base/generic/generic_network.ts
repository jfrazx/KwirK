
/**
* @TODO: Utilize this as a base for a new <Generic>Network
*/

import { Network, INetwork, INetOptions, INetworkOptions } from '../network';
import { GenericUser } from './generic_user';
import { Bot } from '../../../bot';
import * as _ from 'lodash';

export class Generic extends Network implements IGeneric {

  /**
  * @param <Bot> bot: The bot!!!
  * @param <IGenericOptions> options: Options for configuring this network type
  */
  constructor( bot: Bot, options: IGenericOptions ) {
    super( bot, options );

    _.merge( this, _.omit( options, [ 'enable', 'name' ] ) );

  }

  /**
  * Connect to Generic servers
  * @return <void>
  */
  public connect(): void {}

  public disconnect(): void {}

  public send(): void {}

  public addUser(): GenericUser {
    throw new Error( 'not yet implemented' );
  }
}

export interface IGeneric extends INetwork, GenericOptions {

}

export interface IGenericOptions extends GenericOptions, INetOptions {

}

export interface GenericOptions extends INetworkOptions {

}
