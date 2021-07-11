import { INetwork, IConnection, Socket, IServer } from '../interfaces';
import { Abstract } from '@status/abstract';
import { Transform } from 'stream';

@Abstract
export abstract class Connection<N extends INetwork> implements IConnection<N> {
  public abstract server: IServer<N>;
  public socket: Socket;
  public nick: string;

  protected _connected = false;
  protected reconnectDelay = 5000;
  protected writeBuffer: string[] = [];
  protected buffer = new Transform();

  constructor(public network: N) {}

  public isConnected(): boolean {
    return this._connected;
  }

  public disconnected(): boolean {
    return !this._connected;
  }

  /**
   * Connect on with this connection
   * @return <void>
   */
  public abstract connect(): void;

  public abstract dispose(): void;

  public abstract end(): void;

  /**
   * End socket connection and listeners
   * @return <void>
   * @protected
   */
  protected disposeSocket(): void {
    if (this.socket) {
      this.socket.end();
      this.socket.removeAllListeners();
      this.socket = null;
    }
  }
}
