import { IServer, IServerOptions } from '../interfaces';
import { IrcChannel } from './irc_channel';
import { ITLD } from '../../location/tld';
import { Options } from '@kwirk/options';
import { Server } from '../base/server';
import { IIRC, Irc } from './irc';
import * as _ from 'lodash';

const defaultServerOptions: IIrcServerOptions = {
  enable: true,
  host: null,
  port: 6667,
  ssl: false,
  password: null,
  location: null,
};

export class IrcServer extends Server<Irc> implements IIRCServer {
  public channels: IrcChannel[] = [];
  public ssl: boolean;
  public password: string;
  public location: ITLD;

  private connectionHistory: ConnectionHistory[] = [];

  constructor(public network: Irc, options: Options<IIrcServerOptions>) {
    super(network, options.host, options.port);

    if (!this.host || !this.host.length) {
      throw new Error('you must supply a server host');
    }

    this.network.bot.on(`connect::${this.network.name}::${this.host}`, this.onConnect.bind(this));
    this.network.bot.on(`disconnect::${this.network.name}::${this.host}`, this.onDisconnect.bind(this));
  }

  /**
   * @TODO
   */
  public dispose(): void {}

  /**
   * Tasks to perform upon connection with this server
   * @param <AnyNet> network: The network that has connected
   * @param <Server> server: The server that has connected
   * @return <void>
   */
  private onConnect(network: Irc, server: IrcServer): void {
    if (network !== this.network || server !== this) return;

    this.connectionHistory.push({
      connected: Date.now(),
      disconnected: null,
    });

    this._connected = true;
  }

  /**
   * Tasks to perform upon disconnect from this server
   * @param <AnyNet> network: The network that has connected
   * @param <Server> server: The server that has connected
   * @return <void>
   */
  private onDisconnect(network: Irc, server: IrcServer): void {
    if (network !== this.network || server !== this) return;

    this.network.bot.Logger.info(`disconnected from ${this.host} on ${this.network.name}`);
    this._connected = false;
    this.connectionHistory[this.connectionHistory.length - 1].disconnected = Date.now();
  }

  /**
   * Disable this server and jump to next server if connected
   * @return <void>
   */
  public disable(): void {
    this.network.bot.Logger.info(`disabling server ${this.host} on ${this.network.name}`);

    this._enable = false;

    if (this.connected() && this.activeServer()) this.network.jump();
  }

  private activeServer(): boolean {
    return this.network.isActiveServer(this);
  }
}

export interface IIRCServer extends ServerOptions, IServer<IIRC> {}

export interface IIrcServerOptions extends ServerOptions {
  enable?: boolean;
}

export interface ServerOptions extends IServerOptions {
  host: string;
  ssl?: boolean;
  password?: string;
  location?: ITLD;
}

interface ConnectionHistory {
  connected: number;
  disconnected: number;
}
