
import { AnyNet } from '../netfactory';

export class User implements IUser {

  constructor( public network: AnyNet, public name: string ) {

  }

}

export interface IUser extends IUserOptions {
  network: AnyNet;
}

export interface IUserOptions {
  name: string;
}
