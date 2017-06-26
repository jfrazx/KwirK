'use strict';

import { Target, ITarget } from './target';
import { Network } from './network';

export abstract class User<N extends Network> extends Target implements IUser<N> {

  constructor( public network: N, options: IUserOptions ) {
    super( options.name.replace(/[^0-9a-zA-Z\-_.\/]/g, ''));

    this.network.bot.Logger.info( `Creating new user ${ this.name } on network ${ this.network.name }` );
  }
}

export interface IUser<N> extends IUserOptions, ITarget {
  network: N;
}

export interface IUserOptions {
  name: string;
}
