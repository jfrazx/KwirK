
import { AnyNet, IAnyNet } from '../netfactory';
import { Target, ITarget } from './target';
import { User } from './user';
import * as _ from 'lodash';

export abstract class Channel extends Target implements IChannel {

  public users: User[] = [];

  protected _in_channel: boolean = false;

  constructor( public network: AnyNet, options: IChannelOptions ) {
    super( options.name );
  }

  /**
  * Set whether or not the bot is in the channel
  * @param <boolean> value:
  * @return <void>
  */
  set inChannel( value: boolean ) {
    this._in_channel = value;
  }

  get inChannel(): boolean {
    return this._in_channel;
  }

  public removeUser<T extends User>( nick: T ): void;
  public removeUser( nick: string ): void;
  public removeUser( nick: any ): void {
    let instance = false;
    if ( nick instanceof User )
      instance = true;

    _.remove( this.users, ( user ) => {
      return instance ? user == nick : user.name === nick;
    });
  }
}

export interface IChannel extends IChannelOptions, ITarget {
  network: AnyNet;
}

export interface IChannelOptions {
  name: string;
}
