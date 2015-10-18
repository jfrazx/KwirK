
/**
* @TODO: Utilize this as a base for a new <Generic>User
*/

import { User, IUser, IUserOptions } from '../user';
import { Generic } from './generic_network';

export class GenericUser extends User implements IGenericUser {

  constructor( network: Generic, options: IGenericUserOptions ) {
    super( network, options );
  }

  public action(): void {}

  public dispose(): void {}

  public notice(): void {}

  public say(): void {}

  public send(): void {}
}

export interface IGenericUser extends IUser, IGenericUserOptions {

}

export interface IGenericUserOptions extends IUserOptions {

}
