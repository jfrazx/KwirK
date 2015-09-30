
import { Bot } from '../../bot';
import { Server } from './server';
import { AnyNet } from '../netfactory';
import { Socket } from 'net';
import { TLSSocket } from 'tls';
import { Transform } from 'stream';

export class Connection implements IConnection {

  public socket: Socket | TLSSocket;

  protected _connected = false;
  protected reconnect_delay: number = 5000;
  protected write_buffer: string[] = [];
  protected buffer = new Transform();


  constructor( public network: AnyNet, public server: Server ) {

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

  /**
  * End socket connection and listeners
  * @return <void>
  * @protected
  */
  protected disposeSocket(): void {
    if ( this.socket ) {
      this.socket.end();
      this.socket.removeAllListeners();
      this.socket = null;
    }
  }

}

export interface IConnection extends IConnectionOptions {
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
