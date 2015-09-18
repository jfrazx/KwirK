
import { IRC } from './irc';

export class User {

  public nick: string;

  constructor( public network: IRC, options?: IUserOptions ) {
    this.nick = options.nick;
  }
}

export interface IUserOptions {
  nick: string;
}
