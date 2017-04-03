
import { Channel } from '../networks/base/channel';
import { Network } from '../networks/base/network';
import { User } from '../networks/base/user';
import { Bind } from './bind';

export class Message<N extends Network> implements IMessage<N> {
  public network: N;
  public channel: Channel<N>;
  public user: User<N>;
  public target: Channel<N> | User<N>;
  public nick: string;

  public content: string;
  public events: string[];
  public type: string;
  public timestamp: number;

  public bind: Bind;
  public original: IMessageOptions<N>;
  public response: string;
  public command: string;

  constructor( message: IMessageOptions<N> ) {
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
    return !!~this.events.indexOf( 'notice' );
  }

  /**
  * Was this message private?
  * @return <boolean>
  */
  public private(): boolean {
    return !!~this.events.indexOf( 'private' );
  }

  /**
  * Was this message public?
  * @return <boolean>
  */
  public public(): boolean {
    return !!~this.events.indexOf( 'public' );
  }

  /**
  * Was this message an action?
  * @return <boolean>
  */
  public action(): boolean {
    return !!~this.events.indexOf( 'action' );
  }

  /**
  * Was this message a message?
  * @return <boolean>
  */
  public message(): boolean {
    return !!~this.events.indexOf( 'message' );
  }

  /**
  * Was this message a join?
  * @return <boolean>
  */
  public join(): boolean {
    return !!~this.events.indexOf( 'join' );
  }

  /**
  * Was this message a part?
  * @return <boolean>
  */
  public part(): boolean {
    return !!~this.events.indexOf( 'part' );
  }

  /**
  * Was the bot the originator of the message?
  * @return <boolean>
  */
  public isBot(): boolean {
    return this.nick === this.network.botNick();
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

interface IMessage<N extends Network> extends MessageOptions<N> {
  bind: Bind;
  content: string;
  events: string[];
  original: IMessageOptions<N>;
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

export interface IMessageOptions<N extends Network> extends MessageOptions<N> {
  message?: string;
}

interface MessageOptions<N extends Network> {
  network: N;
  channel: Channel<N>;
  user: User<N>;
  target?: Channel<N> | User<N>;
  nick: string;
  command: string;
}
