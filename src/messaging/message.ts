
import { Channel } from '../networks/base/channel';
import { AnyNet } from '../networks/netfactory';
import { User } from '../networks/base/user';
import { Bind } from './bind';

export class Message implements IMessage {
  public network: AnyNet;
  public channel: Channel;
  public user: User;
  public target: Channel | User;
  public nick: string;

  public content: string;
  public events: string[];
  public type: string;
  public timestamp: number;

  public bind: Bind;
  public original: IMessageOptions;
  public response: string;
  public command: string;

  constructor( message: IMessageOptions ) {
    this.network = message.network;
    this.channel = message.channel;
    this.user    = message.user;
    this.target  = message.target;
    this.content = message.message || '';
    this.timestamp = Date.now();
    this.nick = message.nick;
    this.command = message.command;
    this.events = [ 'catchall' ];

    this.type = this.network.type;

    /**
    * keep the original data
    */
    this.original = message;
  }

  /**
  * Was this message a notice?
  * @return <boolean>
  */
  public notice(): boolean {
    return this.events.indexOf( 'notice' ) >= 0;
  }

  /**
  * Was this message private?
  * @return <boolean>
  */
  public private(): boolean {
    return this.events.indexOf( 'private' ) >= 0;
  }

  /**
  * Was this message public?
  * @return <boolean>
  */
  public public(): boolean {
    return this.events.indexOf( 'public' ) >= 0;
  }

  /**
  * Was this message an action?
  * @return <boolean>
  */
  public action(): boolean {
    return this.events.indexOf( 'action' ) >= 0;
  }

  /**
  * Was this message a message?
  * @return <boolean>
  */
  public message(): boolean {
    return this.events.indexOf( 'message' ) >= 0;
  }

  /**
  * Was this message a join?
  * @return <boolean>
  */
  public join(): boolean {
    return this.events.indexOf( 'join' ) >= 0;
  }

  /**
  * Was this message a part?
  * @return <boolean>
  */
  public part(): boolean {
    return this.events.indexOf( 'part' ) >= 0;
  }

  /**
  * Was the bot the originator of the message?
  * @return <boolean>
  */
  public isBot(): boolean {
    return this.nick == this.network.myNick();
  }

  /**
  * Format a bind response
  * @return <void>
  */
  public formatResponse(): void {
    let nick = this.user ? this.user.name : this.nick;

    switch ( this.command ) {

      case 'JOIN':
        this.response = `${ nick } has joined ${ this.channel.name } on ${ this.channel.network.name }`;

        break;
      case 'PART':
        this.response = `${ nick } has left ${ this.channel.name } on ${ this.channel.network.name }`;

        break;

      case 'AWAY':

        break;

      default:
        this.response = `${ this.bind.prefix }<${ nick }> ${ this.content }`;
    }
  }
}

interface IMessage extends MessageOptions {
  bind: Bind;
  content: string;
  events: string[];
  original: IMessageOptions;
  response: string;
  timestamp: number;
  type: string;

  formatResponse(): void;

  action(): boolean;
  message(): boolean;
  notice(): boolean;
  private(): boolean;
  public(): boolean;
}

export interface IMessageOptions extends MessageOptions {
  message?: string;
}

interface MessageOptions {
  network: AnyNet;
  channel: Channel;
  user: User;
  target?: Channel | User;
  nick: string;
  command: string;
}
