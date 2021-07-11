import { INetwork, Network, Server, INetworkOptions } from '@kwirk/networks';
import { NetworkRuleRunner, NetworkRuleConstructor } from '../rules';
import { EventEmitter } from '../utilities/events';
import { AnyNet } from '../networks/netfactory';
import { EventEmitter2 } from 'eventemitter2';
import { Logger } from '../utilities/logger';
import { Router } from '../messaging/router';
import { Timer } from '../utilities/timer';
import { asArray } from '@jfrazx/asarray';
import * as _ from '../utilities/lodash';
import * as winston from 'winston';

const Color = require('../utilities/color');

Color.global();

export class Bot extends EventEmitter implements IBot {
  public network: { [network: string]: AnyNet } = Object.create(null);
  public timers: { [network: string]: Timer[] } = Object.create(null);
  public router: Router = new Router(this);
  public Logger = Logger;
  public Timer = Timer;

  private static _instance: Bot;

  constructor() {
    super();

    if (Bot._instance) {
      return Bot._instance;
    }

    Bot._instance = this;

    this.setMaxListeners(0);
    this.Timer.emitter = this;

    process.on('SIGINT', () => {
      this.Logger.info(`Quitting all networks`);
      this.quit(() => {
        process.exit(0);
      });
    });

    this.setupListeners();
  }

  registerNetworkRule<T extends INetwork, O extends INetworkOptions>(
    RuleConstructor: NetworkRuleConstructor<T, O> | NetworkRuleConstructor<T, O>[],
  ) {
    asArray(RuleConstructor).forEach((rule) => NetworkRuleRunner.register(rule));

    return this;
  }

  /**
   * Start all the networks, or just one
   * @param <AnyNet> network: The single network that you want to start
   * @return <void>
   */
  public start(network?: AnyNet): void {
    if (network) {
      if (network instanceof Network) {
        if (!this.network[network.name]) {
          this.network[network.name] = network;
        }

        return network.connect();
      } else {
        // should I throw or just log, emit and ignore ?
        throw new Error(`${typeof network} is not an instance of a known network`);
      }
    }

    // no networks?
    if (Object.keys(this.network).length === 0) {
      this.emit('error', new Error('no networks available'));
      return;
    }

    for (const [_, network] of Object.entries(this.network)) {
      network.connect();
    }
  }

  /**
   * Add a new network to the bot
   * @param <IAnyNet> networkOptions: The network configuration information
   * @param <Function> callback: Optional callback to perform after network add
   * <> @param <Error> err: Error to return or null
   * <> @param <AnyNet> network: The newly created network object
   * @return <Bot>
   */
  public addNetwork<T extends INetworkOptions>(networkOptions: T, callback?: Function): IBot {
    const network = this.createNetwork(networkOptions);
    let error: Error = null;

    if (this.networkExists(network.name)) {
      error = new Error(`network ${network.name} already exists`);

      this.emit('error', error);
    } else {
      this.network[network.name] = network;
    }

    callback && callback(error, network);

    return this;
  }

  private createNetwork<T extends INetworkOptions>(networkOptions: T): AnyNet {
    return NetworkRuleRunner.create(this, networkOptions);
  }

  /**
   * Retrieve a network based on its name
   * @param <string> name: The name of the network to find
   * @return <AnyNet>
   */
  public getNetwork(name: string): AnyNet {
    return this.network[name];
  }

  /**
   * Remove a network from the Networks Array/Object
   * @param <AnyNet> network: The network to remove
   * @return <Bot>
   */
  public removeNetwork(network: AnyNet, callback?: Function): IBot {
    if (this.networkExists(network.name)) {
      this.emit('removing network', network.name);
      this.Logger.info('Removing network ' + network.name);

      this.clearTimers(network.name);

      if (network.connected()) {
        network.disconnect((err?: Error) => {
          if (err) {
            this.emit('error', err, 'removeNetwork');
          }
          callback && callback(err);
        });
      }
      delete this.network[network.name];
    }

    callback && callback(null);

    return this;
  }

  public networkExists(name: AnyNet): boolean;
  public networkExists(name: string): boolean;
  public networkExists(name: any): boolean {
    if (name instanceof Network) {
      return Boolean(_.find(this.network, (network) => network === name));
    }

    return Boolean(this.network[name]);
  }

  /**
   * Clear the timers of a particular network, or all of them
   * @param <string> network: The name of the network to clear timers
   * @return <Bot>
   */
  public clearTimers(network?: string): IBot {
    const networks = network ? [this.network[network]] : Object.values(this.network);

    for (const network of networks) {
      network.clearTimers();
    }

    return this as IBot;
  }

  /**
   * Stop a network
   * @param <AnyNet> network: The network to disconnect
   * @param <string> message: The message to send to the network
   * @return <void>
   */
  public stop(network: AnyNet, message?: string): void {
    this.network[network.name].disconnect(message);
  }

  /**
   * Stop all connections and end the program
   * @param <string> message: A string message to send with the disconnect
   * @param <Function> callback: Optional callback
   * @return <void>
   * TODO: end krepl and http as well when implemented
   */
  public quit(callback?: Function): void;
  public quit(message: string, callback?: Function): void;
  public quit(message: any, callback?: Function): void {
    if (typeof message === 'function') {
      callback = message;
      message = undefined;
    }

    this.emit('quit', message);

    Object.values(this.network).forEach((network) => this.stop(network, message));

    callback && callback(null);

    process.nextTick(() => {
      this.Logger.info('kwirk bot quitting all networks');
    });
  }

  /**
   * Setup general listeners
   * @return <void>
   * @private
   */
  private setupListeners(): void {
    this.on('connect::*', this.onConnect.bind(this));
    this.on('registered::*', this.onRegistered.bind(this));
    this.on('disconnect::*', this.onDisconnect.bind(this));
    this.on('error', this.onError.bind(this));
  }

  /**
   * Fired when a network is first connected
   * @param <AnyNet> network: The network that was connected
   * @param <Server> server: The network server that was connected
   * @return <void>
   * @private
   */
  private onConnect(network: AnyNet, server: Server<AnyNet>): void {
    this.Logger.info(
      `connected to network ${network.name} on ${server.host}${
        server.port ? ':' + server.port.toString() : ''
      }`,
    );
  }

  /**
   * Fired when a network is disconnected
   * @param <AnyNet> network: The network that was disconnected
   * @param <Server> server: The network server that was disconnected
   * @return <void>
   * @private
   */
  private onDisconnect(network: AnyNet, server: Server<AnyNet>): void {
    this.Logger.info(
      `disconnected from network ${network.name} on ${server.host}${
        server.port ? ':' + server.port.toString() : ''
      }`,
    );
  }

  /**
   * Fired on any error event
   * @param <Error> e: The error object
   * @return <void>
   * @private
   */
  private onError(e: Error): void {
    this.Logger.error(e.name);
    this.Logger.error(e.message);
    this.Logger.error(e.stack);
  }

  /**
   * Fired when a network is first registered
   * @param <AnyNet> network: The network that was registered
   * @param <Server> server: The network server that was registered
   * @return <void>
   * @private
   */
  private onRegistered(network: AnyNet, server: Server<AnyNet>): void {
    this.Logger.info(
      `registered network ${network.name} on ${server.host}${
        server.port ? ':' + server.port.toString() : ''
      }`,
    );
  }

  public static bot(): IBot {
    if (this._instance) return this._instance;
    return new Bot();
  }
}

export interface IBot extends EventEmitter2 {
  network: { [network: string]: AnyNet };
  Logger: typeof winston;
  Timer: typeof Timer;
  router: Router;

  timers: { [network: string]: Timer[] };

  addNetwork<T extends INetworkOptions>(networkOptions: T, callback?: Function): IBot;
  getNetwork(network: string): AnyNet;
  networkExists(network: AnyNet): boolean;
  networkExists(name: string): boolean;
  removeNetwork(network: AnyNet, callback?: Function): void;

  registerNetworkRule<T extends INetwork, O extends INetworkOptions>(
    RuleConstructor: NetworkRuleConstructor<T, O> | NetworkRuleConstructor<T, O>[],
  ): IBot;

  start(network?: AnyNet): void;
  stop(network: AnyNet): void;
  quit(callback?: Function): void;
  quit(message: string, callback?: Function): void;
  quit(): void;
}
