import { Channel, INetwork, User } from '@kwirk/networks';
import { Message } from './message';

/**
 * @todo work in progress...
 */

export class Response<N extends INetwork> implements IResponse<N> {
  public message: string;
  public target: User<N> | Channel<N>;
  public origin_user: User<N>;
  public origin_channel: Channel<N>;

  constructor(message: Message<N>);
  constructor(options: IResponseOptions<N>);
  constructor(options: any) {
    this.message = options.message || options.content;
    this.target = options.target;
    this.origin_user = options.origin_user || options.user;
    this.origin_channel = options.origin_channel || options.channel;
  }
}

export interface IResponse<N extends INetwork> extends IResponseOptions<N> {}

export interface IResponseOptions<N extends INetwork> {
  message: string;
  origin_user: User<N>;
  origin_channel: Channel<N>;
  target: User<N> | Channel<N>;
}
