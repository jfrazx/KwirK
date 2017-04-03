
import { AnyNet, IAnyNet } from '../netfactory';
import { Target, ITarget } from './target';
import { Network } from './network';
import { User } from './user';
import * as _ from '../../utilities/lodash';


export abstract class Channel<N extends Network> extends Target implements IChannel<N> {

  public users: User<N>[] = [];

  protected _in_channel: boolean = false;

  constructor( public network: N, options: IChannelOptions ) {
    super( options.name );

    this.network.bot.Logger.info( `Creating new channel ${ this.name } on network ${ this.network.name }` );
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

  public removeUser( nick: User<N> ): void;
  public removeUser( nick: string ): void;
  public removeUser( nick: any ): void {
    let instance = nick instanceof User;

    _.remove( this.users, ( user ) => {
      return (instance ? user.name : user) === nick;
    });
  }
}

export interface IChannel<N extends Network> extends IChannelOptions, ITarget {
  network: N;
}

export interface IChannelOptions {
  name: string;
}
