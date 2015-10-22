'use strict';

import { Target, ITarget } from './target';
import { AnyNet } from '../netfactory';

export abstract class User extends Target implements IUser {

  constructor( public network: AnyNet, options: IUserOptions ) {
    super( options.name.replace( /[^0-9a-zA-Z\-_.\/]/g, '' ));

    this.network.bot.Logger.info( `Creating new user ${ this.name } on network ${ this.network.name }` );
  }
}

export interface IUser extends IUserOptions, ITarget {
  network: AnyNet;
}

export interface IUserOptions {
  name: string;
}
