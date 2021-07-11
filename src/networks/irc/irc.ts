import { INetwork, INetOptions, INetworkOptions } from '../interfaces';
import { IrcChannel, IIrcChannelOptions } from './irc_channel';
import { IrcServer, IIrcServerOptions } from './irc_server';
import { IrcUser, IIrcUserOptions } from './irc_user';
import { IrcServersList } from './irc_servers_list';
import { IrcConnection } from './irc_connection';
import { UsersList } from '../base/users_list';
import { Timer } from '../../utilities/timer';
import { Options } from '@kwirk/options';
import { AnyNet } from '../netfactory';
import { ISasl } from './sasl/sasl';
import { Network } from '../base';
import { IBot } from '@kwirk/bot';
import { Ircd } from './ircd';
import * as _ from 'lodash';

export class Irc extends Network<IIRC, IRCOptions> implements IIRC {
  private static readonly DEFAULT_DISABLE = 180000;

  public serverList: IrcServersList;
  public channels: IrcChannel[] = [];
  public channel: { [chan: string]: IrcChannel } = {};
  public connection: IrcConnection;
  public ircd: Ircd;
  public alt_nick: string;
  public quit_message: string;
  public encoding: string;
  public reject_invalid_certs: boolean;
  public password: string;
  public user_name: string;
  public real_name: string;
  public modes: string[];
  public sasl: ISasl;
  public use_ping_timer: boolean;
  public reg_listen: string;
  public ping_delay: number;
  public users_list: UsersList<Irc, IrcUser>;

  private auto_disabled_timer: Timer;
  private auto_disable_interval = Irc.DEFAULT_DISABLE;
  private auto_disable_times = 0;

  constructor(bot: IBot, public options: Options<IIrcOptions>) {
    super(bot, options);

    this.serverList = new IrcServersList(this, this.options.servers);
    this.users_list = new UsersList<Irc, IrcUser>(this, IrcUser);

    this.ircd = new Ircd(this);
    this.connection = new IrcConnection(this, {
      pingDelay: this.options.ping_delay,
    });

    this.setupListeners();
  }

  /**
   * Add a new IRC Server to servers array
   * @param <IServer> serve: The options for configuring the new server
   * @return <void>
   */
  public addServer(server: IIrcServerOptions, callback?: Function): Irc {
    this.serverList.addServer(server, callback);

    return this;
  }

  /**
   * Does the server exist?
   * @param <string|Server> target: The host or Server to check for existence
   * @return <boolean>
   */
  public serverExists(host: IrcServer): boolean;
  public serverExists(host: string): boolean;
  public serverExists(host: any): boolean {
    return this.serverList.serverExists(host);
  }

  /**
   * Add new channel to channels array
   * @param <IChannel> chan: The options for configuring a new channel
   * @return <IrcChannel>
   * @todo change this to return IRC, for consistency
   */
  public addChannel(chan: IIrcChannelOptions, callback?: Function): IrcChannel {
    let channel: IrcChannel;

    if (this.channel[chan.name]) {
      channel = this.channel[chan.name];

      this.bot.emit(`channel_exists::${this.name}`, this, channel);
    } else {
      channel = new IrcChannel(this, chan);

      this.channel[channel.name] = channel;
      this.channels.push(channel);
    }

    callback?.(null, channel);

    return channel;
  }

  /**
   * Does this channel exist?
   * @param <String|IrcChannel> name: The name or Channel to check for existence
   * @return <boolean>
   */
  public channelExists(name: IrcChannel): boolean;
  public channelExists(name: string): boolean;
  public channelExists(name: any): boolean {
    const instance = name instanceof IrcChannel;

    return !!_.find(this.channels, (channel: IrcChannel) => {
      return name === (instance ? channel : channel.name);
    });
  }

  /**
   * Are we in this channel?
   * @param <string> channel: The channel we may or may not be in
   * @return <boolean>
   */
  public inChannel(channel: string): boolean {
    if (this.channel[channel]) {
      return this.channel[channel].inChannel;
    }

    return false;
  }

  /**
   * Send a message to the server
   * @param <String> message: The message to send...
   * @return <void>
   */
  public send(message: string, callback?: Function): void {
    this.connection.send(message, callback);
  }

  /**
   * Jump to the next available server
   * @param <String> message: the message to send when jumping
   * @return <void>
   */
  public jump(message = 'jumping to next available server'): void {
    if (this.connected()) {
      this.disconnect(message, this.connect.bind(this));
    }

    this.connect();
  }

  public disconnect(): void;
  public disconnect(callback: Function): void;
  public disconnect(message: string): void;
  public disconnect(message: string, callback: Function): void;
  public disconnect(message?: any, callback?: Function): void {
    if (typeof message === 'function') {
      callback = message;
      message = undefined;
    }

    if (this.disconnected()) {
      return callback && callback(null);
    }

    this.bot.Logger.info(`Disconnecting network ${this.name}`);

    this.connection.disconnect(message, callback);
  }

  /**
   * Connect to the IRC Server
   * @return <void>
   */
  public connect(callback?: Function): void {
    let server: IrcServer;

    console.log(this, 'what is this');

    if (this.disabled() || this.connected()) {
      if (this.auto_disabled_timer)
        this.bot.Logger.info(
          `network ${this.name} has been automatically disabled. ${(
            this.auto_disabled_timer.waitTime / 1000
          ).toString()} seconds left`,
        );

      return callback?.(null);
    }

    if (!(server = this.serverList.activeServer())) {
      this.setDisableTimer();
      return callback?.(null);
    }

    this.connection.dispose();
    this.connection.server = server;

    this.preparation();

    this.connection.connect(callback);
  }

  public dispose(): void {
    this.users.forEach((user) => user.dispose());
    Object.keys(this.channel).forEach((key) => this.channel[key].dispose());

    this.users = [];
    this.channel = {};
  }

  /**
   * Add a user to the given network
   * @param <string> name: The name of the user to add
   * @return <IrcUser>
   */
  public addUser(opts: IIrcUserOptions): IrcUser {
    let user: IrcUser;

    if (this.userExists(opts.name)) {
      user = <IrcUser>this.findUser(opts.name);
    } else {
      user = new IrcUser(this, opts);

      this.users.push(user);
    }

    return user;
  }

  public isActiveServer(server: IrcServer): boolean {
    return this.connection.server === server;
  }

  /**
   * Generate a nickname from the main or alternate nicks
   * @param <String> nick: the nick to potentially modify
   * <> @default primary nick (this.nick)
   * @param <boolean> force: Force the nick to alter if it has not changed
   * <> @default false
   * @return <String>
   */
  public generateNick(force?: boolean): string;
  public generateNick(nick?: string, force?: boolean): string;
  public generateNick(nick?: any, force?: boolean): string {
    let newnick: string;

    if (_.isBoolean(nick)) {
      force = nick;
      nick = this.nick;
    }

    nick = nick || this.nick;

    newnick = this.randomChars(nick);

    if (force && nick === newnick) {
      if (nick !== this.alt_nick) {
        return this.generateNick(this.alt_nick, true);
      }
      if (newnick[newnick.length - 1] === '_') {
        return this.generateNick(newnick + '?', true);
      }
      newnick += '_';
    }

    return newnick;
  }

  private randomChars(nick: string): string {
    return nick
      .replace(/\?/g, () => String.fromCharCode(97 + Math.floor(Math.random() * 26)))
      .replace(/[^0-9a-zA-Z\-_.\/]/g, '');
  }

  private setDisableTimer(): void {
    this.disable();
    this.auto_disable_interval =
      this.auto_disable_interval * ++this.auto_disable_times || this.auto_disable_interval;

    this.bot.Logger.warn(
      `no servers enabled, starting auto disabled timer for ${Math.round(
        this.auto_disable_interval / 60 / 1000,
      ).toString()} minutes: ${this.name}`,
    );

    this.auto_disabled_timer = this.Timer(
      {
        autoStart: true,
        blocking: true,
        immediate: false,
        infinite: false,
        interval: this.auto_disable_interval,
        reference: `auto_disabled_timer::${this.name}`,
      },
      this.disableCheck.bind(this),
    );
  }

  private preparation(): void {
    this.options.channels.forEach((channel) => {
      this.addChannel(channel);
    });

    // this.channels_list = new ChannelsList<IrcChannel>(this);
  }

  /**
   * Check if servers are available after network is auto-disabled
   * @param <Function> done: The function to call once the checking is complete
   * @private
   */
  private disableCheck(done: Function): void {
    this.bot.Logger.info(`auto disabled timer invoked network server enabling: ${this.name}`);

    this.enable();
    this.serverList.enableAll();
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
    this.bot.on(`registered::${this.name}`, this.onRegistered.bind(this));

    this.bot.on(`connect::${this.name}`, (network: Irc, server: IrcServer) => {
      this._connected = true;
    });

    this.bot.on(`jump::${this.name}`, this.jump.bind(this));
  }

  /**
   * Called when 'registered' is emitted
   *
   * @private
   * @param {AnyNet} network
   * @memberof Irc
   */
  private onRegistered(network: AnyNet): void {
    this.auto_disable_times = 0;
    this.auto_disable_interval = Irc.DEFAULT_DISABLE;

    this.connectionAttempts = this.options.connectionAttempts;
    // perform on registered events, but for now lets try to make the bot join a channel
    Object.entries(this.channel).forEach(([_, channel]) => channel.join());
  }
}

export interface IIRC extends INetwork {
  options: Options<IRCOptions>;
  serverList: IrcServersList;
  users_list: UsersList<Irc, IrcUser>;

  inChannel(channel: string): boolean;
}

export interface IIrcOptions extends IRCOptions, INetOptions {}

export interface IRCOptions extends INetworkOptions {
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
