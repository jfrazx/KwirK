
import { User } from './user';
import { AnyNet } from '../netfactory';
import * as _ from 'lodash';

export class Channel {

  public users: User[];
  public topic: string = null;
  public name: string;
  public password: string;
  public key: string;
  public modes: string[];

  private _in_channel: boolean = false;


  constructor( public network: AnyNet, options: IChannel ) {
    _.merge( this, _.defaults( options, this.defaults() ));

    if ( !this.name || !this.name.trim().length )
      throw new Error('IRC Channel must have a name');
  }

  public toString(): string {
    return this.name;
  }

  public join( key: string = null ): void {
    this.send( _.compact( [ "JOIN", this.name, ( key ? key : this.password ) ] ).join( ' ' ) );
  }

  public send( message: string ): void {
    this.network.send( message );
  }

  /**
  * Causes the bot to part the Channel
  * @param <String> message: the part message
  * @return <void>
  */
  public part( message?: string ): void {
    this.send( "PART " + this.name + " :" + message );
  }

  /**
  *  Removes a user from the channel.
  *
  * This uses the REMOVE command, which is a non-standardized
  * extension. Unlike a kick, it makes a user part. This prevents
  * auto-rejoin scripts from firing and might also be perceived as
  * less aggressive by some. Not all IRC networks support this
  * command.
  *
  * @param <User> user: the User object
  * @param <String> reason: a reason for removing from the Channel
  * @returns <void>
  */
  public remove( user: User, reason?: string ): void {
    this.send( 'REMOVE ' + user.nick + " :" + reason );
  }

  /**
  * Sets or unsets a Channel mode
  *
  * @param <String> mode: a mode string
  * @returns <void>
  * @example
  *   this.mode( "+n" );
  */
  public mode( mode: string ): void {
    this.send( 'MODE ' + this.name + ' '  + mode );
  }

  public inChannel(): boolean {
    return this._in_channel;
  }


  /**
  * Retrieve the channel encryption key
  *
  * @return <String> || <Null> ( if not set )
  */
  get encryption_key(): string {
    return this.key;
  }

  /**
  * Set the channel encryption key
  *
  * @param <String> key: The shiny new channel encryption key
  * @return <void>
  */
  set encryption_key( key: string ) {
    this.key = key;
  }

  /**
  * Retrieve the channel key ( aka password )
  *
  * @return <String> || <Null> ( if not set )
  */
  get channel_key(): string {
    return this.password;
  }

  /**
  * Set the channel key ( aka password )
  *
  * @param <String> key: The new channel key
  *
  */
  set channel_key( key: string ) {
    this.password = key;

    // TODO : if in channel, set new key
  }

  private defaults(): IChannel {
    return {
      channel: null,
      modes: [],
      password: null,
      key: null
    }
  }
}


export interface IChannel {
  channel: string;
  modes?: string[];
  password?: string;
  key?: string;
}
