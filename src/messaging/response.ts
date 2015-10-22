
import { Channel } from '../networks/base/channel';
import { Network } from '../networks/base/network';
import { User } from '../networks/base/user';
import { Message } from './message';

/**
* @todo work in progress...
*/

export class Response implements IResponse {

  public message: string;
  public target: User | Channel;
  public origin_user: User;
  public origin_channel: Channel;

  constructor( message: Message );
  constructor( options: IResponseOptions );
  constructor( options: any ) {
    this.message        = options.message || options.content;
    this.target         = options.target;
    this.origin_user    = options.origin_user || options.user;
    this.origin_channel = options.origin_channel || options.channel;
  }
}

export interface IResponse extends IResponseOptions {

}

export interface IResponseOptions {
  message: string;
  origin_user: User;
  origin_channel: Channel;
  target: User | Channel;
}
