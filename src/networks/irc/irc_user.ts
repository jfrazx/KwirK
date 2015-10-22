
import { User, IUserOptions, IUser } from '../base/user';
import { Irc } from './irc';

export class IrcUser extends User implements IIrcUser {

  public ident: string;
  public hostname: string;

  constructor( network: Irc, options?: IIrcUserOptions ) {
    super( network, options );

    this.ident = options.ident || '';
    this.hostname = options.hostname || '';
  }

  public dispose(): void {

  }

  /**
  * Perform an action in the user
  * @param <string> message: The action to perform
  * @return <void>
  */
  public action( message: string ): void {
    this.say( `\u0001ACTION ${ message }\u0001` );
  }

  /**
  * Send a message to the user
  * @param <string> message: The message to send to the user
  * @return <void>
  */
  public say( message: string ): void {
    this.send( `PRIVMSG ${ this.name } :${ message }` );
  }

  /**
  * Send a NOTICE to the user
  * @param <string> message: The notice to send to the user
  * @return <void>
  */
  public notice( message: string ): void {
    this.send( `NOTICE ${ this.name } :${ message }` );
  }

  /**
  * Send a message to the network
  * @param <string> message: The message to send to the network
  * @return <void>
  */
  public send( message: string ): void {
    this.network.send( message );
  }
}

interface IIrcUser extends IIrcUserOptions, IUser {

}

export interface IIrcUserOptions extends IUserOptions {
  ident?: string;
  hostname?: string;
}
