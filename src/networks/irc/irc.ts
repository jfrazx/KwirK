'use strict';

import { Network, INetwork, INetOptions, INetworkOptions } from '../base/network';
import { IrcChannel, IIrcChannelOptions } from './irc_channel';
import { IrcServer, IIrcServerOptions } from './irc_server';
import { IrcUser, IIrcUserOptions } from './irc_user';
import { IrcServersList } from './irc_servers_list';
import { IrcConnection } from './irc_connection';
import { UsersList } from '../base/users_list';
import { TimerJobs } from 'timerjobs/src/timerjobs';
import { AnyNet } from '../netfactory';
import { ISasl } from './sasl/sasl';
import { Bot } from '../../bot';
import { Ircd } from './ircd';
import * as _ from 'lodash';

export class Irc extends Network implements IIRC {

  public servers_list: IrcServersList;
  public channels: IrcChannel[] = [];
  public channel: { [ chan: string ]: IrcChannel } = {};
  public connection: IrcConnection;
  public connection_attempts: number;
  public ircd: Ircd;
  public name: string;
  public nick: string;
  public alt_nick: string;
  public quit_message: string;
  public encoding: string;
  public reject_invalid_certs: boolean;
  public password: string;
  public user_name: string;
  public real_name: string;
  public modes: string[];
  public options: IIrcOptions;
  public sasl: ISasl;
  public use_ping_timer: boolean;
  public reg_listen: string;
  public ping_delay: number;
  public users_list: UsersList<Irc, IrcUser>;


  private auto_disabled_timer: TimerJobs;
  private auto_disable_interval = Irc.DEFAULT_DISABLE;
  private auto_disable_times    = 0;

  private static DEFAULT_DISABLE = 180000;

  /**
  * @param <Bot> bot: The bot!!!
  * @param <IIrcOptions> options: Options for configuring this network type
  */
  constructor( bot: Bot, options: IIrcOptions ) {
    super( bot, options );

    this.options = _.defaults( options, this.defaults() );

    _.merge( this, _.omit( this.options, [ 'enable', 'servers', 'channels', 'name' ] ) );

    this.servers_list  = new IrcServersList( this, this.options.servers );
    this.users_list    = new UsersList<Irc, IrcUser>(this, IrcUser);

    this.ircd = new Ircd( this );
    this.connection = new IrcConnection( this, {
      ping_delay: this.options.ping_delay,
    });

    this.setupListeners();
  }

  /**
  * Add a new IRC Server to servers array
  * @param <IServer> serve: The options for configuring the new server
  * @return <void>
  */
  public addServer( serve: IIrcServerOptions, callback?: Function ): Irc {
    this.servers_list.addServer( serve, callback );
    return this;
  }

  /**
  * Does the server exist?
  * @param <string|Server> target: The host or Server to check for existence
  * @return <boolean>
  */
  public serverExists( host: IrcServer ): boolean;
  public serverExists( host: string ): boolean;
  public serverExists( host: any ): boolean {
    return this.servers_list.serverExists( host );
  }

  /**
  * Add new channel to channels array
  * @param <IChannel> chan: The options for configuring a new channel
  * @return <IrcChannel>
  * @todo change this to return IRC, for consistencys
  */
  public addChannel( chan: IIrcChannelOptions, callback?: Function ): IrcChannel {
    let channel: IrcChannel;

    if ( this.channel[ chan.name ] ) {
      channel = this.channel[ chan.name ];

      this.bot.emit( `channel_exists::${ this.name }`, this, channel );
    }
    else {
      channel = new IrcChannel( this, chan );

      this.channel[ channel.name ] = channel;
      this.channels.push( channel );
    }

    callback && callback( null, channel );

    return channel;
  }

  /**
  * Does this channel exist?
  * @param <String|IrcChannel> name: The name or Channel to check for existence
  * @return <boolean>
  */
  public channelExists( channel: IrcChannel ): boolean;
  public channelExists( name: string ): boolean;
  public channelExists( name: any ): boolean {
    const instance = name instanceof IrcChannel;

    return !( !_.find( this.channels, ( channel: IrcChannel ) => {
      return name === ( instance ? channel : channel.name );
    }));
  }

  /**
  * Are we in this channel?
  * @param <string> channel: The channel we may or may not be in
  * @return <boolean>
  */
  public inChannel( channel: string ): boolean {
    if ( this.channel[ channel ] )
      return this.channel[ channel ].inChannel;

    return false;
  }

  /**
  * Send a message to the server
  * @param <String> message: The message to send...
  * @return <void>
  */
  public send( message: string, callback?: Function ): void {
    this.connection.send( message, callback );
  }

  /**
  * Jump to the next available server
  * @param <String> message: the message to send when jumping
  * @return <void>
  */
  public jump( message = 'jumping to next available server' ): void {
    if ( this.connected() ) {
      this.disconnect( message, this.connect.bind( this ) );
    }

    this.connect();
  }

  public disconnect(): void;
  public disconnect( callback: Function ): void;
  public disconnect( message: string ): void;
  public disconnect( message: string, callback: Function ): void;
  public disconnect( message?: any, callback?: Function ): void {
    if ( typeof message === 'function' ) {
      callback = message;
      message = undefined;
    }

    if ( this.disconnected() ) {
      return callback && callback( null );
    }

    this.bot.Logger.info( `Disconnecting network ${ this.name }` );

    this.connection.disconnect( message, callback );
  }

  /**
  * Connect to the IRC Server
  * @return <void>
  */
  public connect( callback?: Function ): void {
    let server: IrcServer;
    if ( !this.enabled() || this.connected() ) {
      if ( this.auto_disabled_timer )
        this.bot.Logger.info( `network ${ this.name } has been autodisabled. ${ ( this.auto_disabled_timer.waitTime() / 1000 ).toString() } seconds left` );
      return callback && callback( null );
    }

    if ( !(server = this.servers_list.activeServer()) ) {
      this.setDisableTimer();
      return callback && callback ( null );
    }

    this.connection.dispose();
    this.connection.server = server;

    this.preparation();

    this.connection.connect( callback );
  }

  public dispose(): void {
    _.each( this.users, ( user ) => {
      user.dispose();
    });

    _.each( _.keys( this.channel ), ( name ) => {
      this.channel[ name ].dispose();
    });

    this.users   = [];
    this.channel = {};
  }

  /**
  * Add a user to the given network
  * @param <string> name: The name of the user to add
  * @return <IrcUser>
  */
  public addUser( opts: IIrcUserOptions  ): IrcUser {
    let user: IrcUser;

    if ( this.userExists( opts.name ) ) {
      user = <IrcUser> this.findUser( opts.name );
    }
    else {
      user = new IrcUser( this, opts );

      this.users.push( user );
    }

    return user;
  }

  public isActiveServer( server: IrcServer ): boolean {
    return this.connection.server === server;
  }

  /**
  * Generate a nickname from the main or alternate nicks
  * @param <String> nick: the nick to potentially modify
  * <> @default primary nick ( this.nick )
  * @param <boolean> force: Force the nick to alter if it has not changed
  * <> @default false
  * @return <String>
  */
  public generate_nick( force?: boolean ): string;
  public generate_nick( nick?: string, force?: boolean ): string;
  public generate_nick( nick?: any, force?: boolean ): string {
    let newnick: string;
    let letters: string[];

    if ( _.isBoolean( nick ) ) {
      force = nick;
      nick = this.nick;
    }

    nick = nick || this.nick;
    letters = nick.split('');

    while ( ~letters.indexOf( '?' ) ) {
      letters[ letters.indexOf( '?' ) ] = String.fromCharCode( 97 + Math.floor( Math.random() * 26 ) );
    }

    newnick = letters.join( '' ).replace( /[^0-9a-zA-Z\-_.\/]/g, '' );

    if ( force && nick === newnick ) {
      if ( this.alt_nick && this.alt_nick.length && nick !== this.alt_nick ) {
        return this.generate_nick( this.alt_nick, true );
      }
      if ( newnick[ newnick.length - 1 ] === '_' ) {
        return this.generate_nick( newnick + '?', true );
      }
      newnick = nick + '_';
    }

    return newnick;
  }

  private setDisableTimer(): void {
    this.disable();
    this.auto_disable_interval = this.auto_disable_interval * ++this.auto_disable_times || this.auto_disable_interval;

    this.bot.Logger.warn( `no servers enabled, starting auto disabled timer for ${ Math.round( this.auto_disable_interval / 60 / 1000 ).toString() } minutes: ${ this.name }` );

    this.auto_disabled_timer = this.Timer(
      {
        autoStart: true,
        blocking: true,
        immediate: false,
        infinite: false,
        interval: this.auto_disable_interval,
        reference: `auto disabled timer::${ this.name }`,
      },
      this.disableCheck.bind( this )
    );
  }

  private preparation(): void {
    _.each( this.options.channels, ( channel ) => {
      this.addChannel( channel );
    });

    // this.channels_list = new ChannelsList<IrcChannel>(this);

  }


  /**
  * Check if servers are available after network is autodisabled
  * @param <Function> done: The function to call once the checking is complete
  * @private
  */
  private disableCheck( done: Function ): void {
    this.bot.Logger.info( `auto disabled timer invoked network server enabling: ${ this.name }` );

    this.enable();
    this.servers_list.enableAll();
    this.connect();

    done();

    // this.auto_disabled_timer.destroy();
    this.auto_disabled_timer = null;
  }

  /**
  * setup this networks listeners
  * @return <void>
  * @private
  */
  private setupListeners(): void {
    this.bot.on( `registered::${ this.name }` , this.onRegistered.bind( this ) );

    this.bot.on( `connect::${ this.name }`, ( network: Irc, server: IrcServer ) => {
      this._connected = true;
    });

    this.bot.on( `jump::${ this.name }`, this.jump.bind( this ));
  }

  /**
  * Called when 'registered' is emitted
  * @param <AnyNet> network: The network that is now registered
  * @return <void>
  * @private
  */
  private onRegistered( network: AnyNet ): void {
    this.auto_disable_times = 0;
    this.auto_disable_interval = Irc.DEFAULT_DISABLE;

    this.connection_attempts = this.options.connection_attempts;
    // perform on registered events, but for now lets try to make the bot join a channel
    _.each( _.keys( this.channel ), ( name ) => {
      this.channel[ name ].join();
    });
  }

  /**
  * Default network options
  * @return <IIrcOptions>
  */
  private defaults(): IIrcOptions {
    return {
      connection_attempts: 10,
      encoding: 'utf8',
      enable: true,
      nick: 'kwirk',
      alt_nick: 'kw?rk',
      real_name: 'KwirK IRC Bot',
      user_name: 'KwirK',
      password: null,
      modes: [ 'i' ], // user modes, not channel modes
      owner: '',
      trigger: '!',
      quit_message: 'KwirK, a sophisticated utility bot',
      reject_invalid_certs: false,
      sasl: null,
      servers: [],
      channels: [],
      name: null,
      use_ping_timer: false,
      ping_delay: 120000,
      reg_listen: null
    };
  }
}

export interface IIRC extends IRCOptions, INetwork {
  options: IIrcOptions;
  servers_list: IrcServersList;
  users_list: UsersList<Irc, IrcUser>;


  inChannel( channel: string ): boolean;
}

export interface IIrcOptions extends IRCOptions, INetOptions {}

interface IRCOptions extends INetworkOptions {
  alt_nick?: string;
  channels?: IrcChannel[];
  encoding?: string;
  modes?: string[];
  nick?: string;
  owner?: string;
  password?: string;
  quit_message?: string;
  real_name?: string;
  reject_invalid_certs?: boolean;
  sasl?: ISasl;
  servers?: IIrcServerOptions[];
  trigger?: string;
  user_name?: string;
  use_ping_timer?: boolean;
  ping_delay?: number;
  reg_listen?: string;
}
