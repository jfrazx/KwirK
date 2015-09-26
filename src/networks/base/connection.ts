
import { Bot } from '../../bot';
import { Server } from './server';
import { AnyNet } from '../netfactory';
import { Socket } from 'net';
import { TLSSocket } from 'tls';

export class Connection implements IConnection {

  public bot: Bot;
  public socket: Socket | TLSSocket;

  protected _connected = false;
  protected reconnect_delay: number = 4000;
  protected write_buffer: string[] = [];

  constructor( public network: AnyNet, public server: Server ) {
    this.bot = this.network.bot;
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
    return !( this._connected );
  }

  /**
  * Connect on with this connection
  * @return <void>
  */
  public connect(): void {}

  public dispose( message?: string ): void {}

}

export interface IConnection extends IConnectionOptions {
  bot: Bot;
  network: AnyNet;
  server: Server;
  socket: Socket | TLSSocket;

  connect(): void;
  connected(): boolean;
  disconnected(): boolean;
  dispose( message?: string ): void;
}

export interface IConnectionOptions {

}
