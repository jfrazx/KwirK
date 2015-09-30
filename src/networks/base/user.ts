
import { AnyNet } from '../netfactory';

export class User implements IUser {

  constructor( public network: AnyNet, public name: string ) {

  }

  public dispose(): void {}

}

export interface IUser extends IUserOptions {
  network: AnyNet;

  dispose(): void;
}

export interface IUserOptions {
  name: string;
}
