
import { Channel } from '../networks/base/channel';
import { AnyNet } from '../networks/netfactory';
import { User } from '../networks/base/user';
import { Bind } from './bind';

export class Message {
  public network: AnyNet;
  public channel: Channel;
  public user: User;
  public target: Channel | User;
  public message: string;
  public match: RegExpExecArray;
  public timestamp: number;
  public nick: string;
  public bind: Bind;
  public original: any;
  public response_action: string;
  public response: string;
  public command: string;

  constructor( message: any ) {
    this.network = message.network;
    this.channel = message.channel;
    this.user    = message.user;
    this.target  = message.target;
    this.message = message.message;
    this.timestamp = Date.now();
    this.nick = message.nick;
    this.command = message.command;

    /**
    * keep the original data
    */
    this.original = message;
  }

  /**
  * Format a bind response
  * @return <void>
  */
  public formatResponse(): void {

    switch ( this.command ) {

      case 'JOIN':
        this.response = `\026${ this.user.name } has joined ${ this.channel.name } on ${ this.channel.network.name }\026`;

        break;
      case 'PART':
        this.response = `\026${ this.user.name } has left ${ this.channel.name } on ${ this.channel.network.name }\026`;

        break;

      case 'AWAY':

        break;

      default:
        this.response = `${ this.bind.prefix }<${ this.user.name }> ${ this.message }`;
    }
  }

}
