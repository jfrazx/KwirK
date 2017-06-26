
import { Channel, IChannel, IChannelOptions } from '../base/channel';
import { IrcUser, IIrcUserOptions } from './irc_user';
import { Network } from '../base/network';
import { Irc } from './irc';
import * as _ from 'lodash';

export class IrcChannel extends Channel<Irc> implements IIrcChannel {

  public topic: string = null;
  public users: IrcUser[] = [];
  public password: string;
  public key: string;

  /**
  * @todo change to object literal
  */
  public modes: string[];

  constructor( public network: Irc, options: IIrcChannelOptions ) {
    super( network, options );

    _.merge( this, _.omit( _.defaults( options, this.defaults() ), [ 'name' ] ));

    this.network.bot.on('disconnect::' + this.network.name, this.onDisconnect.bind( this ));
  }

  /**
  * Give channel operator status to user
  * @param <IrcUser> user: The user to op
  * @return <void>
  */
  public op( user: IrcUser ): void {
    this.send( `MODE ${ this.name } +o ${ user.name }` );
  }

  /**
  * Removes channel operator status from user
  * @param <IrcUser> user: The user to deop
  * @return <void>
  */
  public deop( user: IrcUser ): void {
    this.send( `MODE ${ this.name } -o ${ user.name }` );
  }

  /**
  * Give channel voice to user
  * @param <IrcUser> user: The user to voice
  * @return <void>
  */
  public voice( user: IrcUser ): void {
    this.send( `MODE ${ this.name } +v ${ user.name }` );

    // if ( this.network.botUser.opped( this.name )) {
    //   return true;
    // }
  }
  /**
  * Removes channel voice from user
  * @param <IrcUser> user: The user to devoice
  * @return <void>
  */
  public devoice( user: IrcUser ): void {
    this.send( `MODE ${ this.name } -v ${ user.name }` );
  }

  /**
  * Have the bot join the channel
  * @param <string> key: The optional key to use to join the channel
  * @return <void>
  */
  public join( key?: string ): void {
    this.send(
      _.compact(
        ['JOIN',
          this.name,
          (key || this.password)
        ]).join(' '),
        true);
  }

  /**
  * Perform an action in the channel
  * @param <string> message: The action to perform
  * @param <boolean> force: Attempt to message the channel even if not in it
  * @return <void>
  */
  public action( message: string, force?: boolean ): void {
    this.say(`\u0001ACTION ${ message }\u0001`, force);
  }

  /**
  * Send a NOTICE to the channel
  * @param <string> message: The notice to send to the channel
  * @param <boolean> force: Attempt to message the channel even if not in it
  * @return <void>
  */
  public notice( message: string, force?: boolean ): void {
    this.send( `NOTICE ${ this.name } :${ message }`, force );
  }

  /**
  * Send a message to the channel
  * @param <string> message: The message to send to the channel
  * @param <boolean> force: Attempt to message the channel even if not in it
  * @return <void>
  */
  public say( message: string, force?: boolean ): void {
    this.send( `PRIVMSG ${ this.name } :${ message }`, force );
  }

  /**
  * Send a message to the network
  * @param <string> message: The message to send to the network
  * @param <boolean> force: Attempt to message the channel even if not in it
  * @return <void>
  */
  public send( message: string, force: boolean = false ): void {
    this.network.bot.Logger.info( 'Received message ' + message );

    if ( message && ( this.inChannel || force ) )
      this.network.send( message );
  }

  /**
  * Causes the bot to part the Channel
  * @param <String> message: the part message
  * @return <void>
  */
  public part( message?: string ): void {
    this.send( `PART ${ this.name } :${ message }` );
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
  public remove( user: IrcUser, reason?: string ): void {
    this.send( `REMOVE ${ user.name } :${ reason }` );
  }

  /**
  * Sets or unsets a Channel mode
  * @param <String> mode: a mode string
  * @returns <void>
  * @example
  *   this.mode( "+n" );
  */
  public mode( mode: string ): void {
    this.send( `MODE ${ this.name } ${ mode }` );
  }

  /**
  * Retrieve the channel encryption key
  * @return <String> || <Null> ( if not set )
  */
  get encryptionKey(): string {
    return this.key;
  }

  /**
  * Set the channel encryption key
  * @param <String> key: The shiny new channel encryption key
  * @return <void>
  */
  set encryptionKey( key: string ) {
    this.key = key;
  }

  /**
  * Retrieve the channel key ( aka password )
  * @return <String> || <Null> ( if not set )
  */
  get channelKey(): string {
    return this.password;
  }

  /**
  * Set the channel key ( aka password )
  * @param <String> key: The new channel key
  * @return <void>
  */
  set channelKey( key: string ) {
    let same = this.password === key;
    this.password = key;

    if ( this._in_channel && !same ) {
      this.network.send( `MODE ${ this.name } ${ this.password ? '+k ' + this.password : '-k' }`  );
    }
  }

  /**
  * @todo fill in the blanks
  */
  public dispose(): void {

  }
  public addUser( user: IrcUser ): IrcUser;
  public addUser( user: IIrcUserOptions ): IrcUser;
  public addUser( user: any ): IrcUser {
    if ( !( user instanceof IrcUser ))
      user = this.network.addUser( user );

    if ( !this.userInChannel( user ) )
      this.users.push( user );

    return user;
  }


  public userInChannel( user: string ): boolean;
  public userInChannel( user: IrcUser ): boolean;
  public userInChannel( user: any ): boolean {
    let instance: boolean = user instanceof IrcUser;

    return !!_.find( this.users, ( person ) => {
      return (instance ? user.name : user ) === person.name;
    });
  }

  private onDisconnect(): void {
    this._in_channel = false;

    this.dispose();
  }

  private setupListeners(): void {
    this.network.bot.on( `join::${ this.network.name }::${ this.name }`, this.on_join.bind( this ) );
  }

  private on_join( user: IrcUser ): void {
    this.network.bot.Logger.info( `user ${ user.name } joined ${ this.name } on ${ this.network.name }` );
    this.addUser( user );
  }

  private defaults(): IIrcChannelOptions {
    return {
      name: null,
      modes: [],
      password: null,
      key: null
    };
  }
}

export interface IIrcChannel extends IIrcChannelOptions, IChannel<Irc> {
  addUser( user: IrcUser ): IrcUser;
  addUser( user: IIrcUserOptions ): IrcUser;

  userInChannel( user: IrcUser ): boolean;
  userInChannel( user: string ): boolean;
}


export interface IIrcChannelOptions extends IChannelOptions {
  modes?: string[];
  password?: string;
  key?: string;
}
