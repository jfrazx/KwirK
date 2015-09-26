
import { IRC } from './irc';

export class IrcUser {

  public nick: string;

  constructor( public network: IRC, options?: IIrcUserOptions ) {
    this.nick = options.nick;
  }
}

export interface IIrcUserOptions {
  nick: string;
}
