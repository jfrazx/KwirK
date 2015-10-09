
import { Target, ITarget } from './target';
import { AnyNet } from '../netfactory';

export abstract class User extends Target implements IUser {

  constructor( public network: AnyNet, options: IUserOptions ) {
    super( options.name.replace( /[^0-9a-zA-Z\-_.\/]/g, '' ));
  }
}

export interface IUser extends IUserOptions, ITarget {
  network: AnyNet;
}

export interface IUserOptions {
  name: string;
}
