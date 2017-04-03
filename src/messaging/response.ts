
import { Channel } from '../networks/base/channel';
import { Network } from '../networks/base/network';
import { User } from '../networks/base/user';
import { Message } from './message';

/**
* @todo work in progress...
*/

export class Response<N extends Network> implements IResponse<N> {

  public message: string;
  public target: User<N> | Channel<N>;
  public origin_user: User<N>;
  public origin_channel: Channel<N>;

  constructor( message: Message<N> );
  constructor( options: IResponseOptions<N> );
  constructor( options: any ) {
    this.message        = options.message || options.content;
    this.target         = options.target;
    this.origin_user    = options.origin_user || options.user;
    this.origin_channel = options.origin_channel || options.channel;
  }
}

export interface IResponse<N extends Network> extends IResponseOptions<N> {

}

export interface IResponseOptions<N extends Network> {
  message: string;
  origin_user: User<N>;
  origin_channel: Channel<N>;
  target: User<N> | Channel<N>;
}
