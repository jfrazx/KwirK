import { IBindOptions } from '../../messaging/bind';
import { Options } from '@kwirk/options';
import { IBot } from '@kwirk/bot';

export interface INetwork {
  options: Options<INetworkOptions>;
  connection: any;
  name: string;
  bot: IBot;

  bind(options: IBindOptions): void;
  connect(): void;
  connected(): boolean;
  disable(): void;
  disconnect(message?: string, callback?: Function): void;

  enabled(): boolean;
  enable(): void;

  send(message: string): void;
  toString(): string;

  botNick(): string;
}

export interface INetOptions {
  /**
   * Should we enable the network? e.g true
   */
  enable?: boolean;
  /**
   * What type of network is this? e.g 'irc' or 'slack'
   */
  type?: string;
}

export interface INetworkOptions extends INetOptions {
  /**
   * Network name, e.g freenode
   */
  name?: string;

  /**
   * How many times should we attempt to reconnect ( before moving to the next server or disabling )
   */
  connectionAttempts?: number;

  /**
   * What type of network is this? e.g 'irc' or 'slack'
   */
  type?: string;
}
