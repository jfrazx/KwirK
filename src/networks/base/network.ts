import { Bind, BindOptions, IBindOptions } from '../../messaging/bind';
import { Timer, ITimerOptions } from '../../utilities/timer';
import { INetworkOptions } from '../interfaces';
import { Connection } from './connection';
import { INetwork } from '../interfaces';
import { Options } from '@kwirk/options';
import { Channel } from './channel';
import { IBot } from '@kwirk/bot';
import { User } from './user';
import * as _ from 'lodash';

export abstract class Network<N extends INetwork, O extends INetworkOptions> implements INetwork {
  public name: string;
  public nick: string;
  public Bind: Bind;
  public users: User<Network<N, O>>[] = [];
  public channels: Channel<Network<N, O>>[] = [];
  public channel: { [chan: string]: Channel<Network<N, O>> } = {};
  public ident: string;
  public type: string;
  public hostname: string;
  public connectionAttempts = 0;

  abstract connection: Connection<Network<N, O>>;

  protected _connected: boolean = false;
  protected _enable: boolean = true;

  constructor(public bot: IBot, public options: Options<O>) {
    if (!options.name || !options.name.trim().length) {
      throw new Error('a network name must be supplied');
    }

    this.name = options.name.toLowerCase();
    this.type = options.type;

    this.bot.Logger.info(`Created new network ${this.name} of type ${this.type}`);
  }

  public bind(options: IBindOptions, inherit: boolean = false): Bind {
    const opts = <BindOptions>options;

    opts.source_network = this.name;

    return new Bind(this.bot, opts, inherit);
  }

  /**
   * Connect to the network
   * @return <void>
   * @abstract
   */
  public abstract connect(): void;

  /**
   * Disable the network
   * @return <void>
   */
  public disable(): void {
    this._enable = false;

    if (this.connected()) this.disconnect();
  }

  /**
   * See if the network is disabled
   * @return <boolean>
   */
  public disabled(): boolean {
    return !this.enabled();
  }

  /**
   * Are we enabled?
   * @return <boolean>
   */
  public enabled(): boolean {
    return this._enable;
  }

  /**
   * Enable the network
   * @return <void>
   */
  public enable(): void {
    this._enable = true;
  }

  /**
   * Are we connected?
   * @return <boolean>
   */
  public connected(): boolean {
    return this._connected;
  }

  /**
   * Are we disconnected?
   * @return <boolean>
   */
  public disconnected(): boolean {
    return !this.connected();
  }

  /**
   * Disconnect the network
   * @return <void>
   * @abstract
   */
  public abstract disconnect(): void;
  public abstract disconnect(callback: Function): void;
  public abstract disconnect(message: string): void;
  public abstract disconnect(message: string, callback: Function): void;
  public abstract disconnect(message?: any, callback?: Function): void;

  /**
   * Send a message to a network connection
   *
   * @param <String> message: The message to be sent
   * @return <void>
   * @abstract
   */
  public abstract send(message: string): void;

  /**
   * The network to a string
   * @return <String>
   */
  public toString(): string {
    return `<${this.type.toUpperCase()}: ${this.name}`;
  }

  /**
   * Create Timers and add them to the Bot Timer object
   * @param <ITimerOptions> options: The options for this Timer
   * @param <Function> callback: The timer job to callback
   * @return <Timer>
   */
  public Timer(options: ITimerOptions, callback: (done: Function) => void): Timer {
    const timer = new this.bot.Timer(callback, options);

    this.bot.timers[this.name].push(timer);

    return timer;
  }

  /**
   * Clear all timers created for this network
   * @return <void>
   */
  public clearTimers(): void {
    this.bot.emit(`clear_timers::${this.name}`, this);
    _.each(this.bot.timers[this.name], (timer) => {
      timer.stop();
    });
  }

  public channelExists(name: string): boolean {
    return Boolean(this.channels.find((channel) => channel.name === name));
  }

  /**
   * Find if the user exists on this network
   * @param <string> name: The name of the user to find
   * @return <boolean>
   */
  public userExists(name: string): boolean {
    return !!this.findUser(name);
  }

  /**
   * Determine the name of the current network bot
   * @return <string>
   */
  public botNick(): string {
    return this.connected() ? this.connection.nick : this.nick;
  }

  /**
   * Find a network user by their username
   * @param <string> name: The name of the user you seek
   * @return <User>
   */
  public findUser(name: string): User<Network<N, O>> {
    return _.find(this.users, (user) => {
      return user.name === name;
    });
  }

  public abstract addUser(name: any): void;
}
