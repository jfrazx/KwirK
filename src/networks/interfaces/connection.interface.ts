import { INetwork } from './network.interface';
import { IServer } from './server.interface';
import { Socket } from './socket.type';

export interface IConnection<N extends INetwork> extends IConnectionOptions {
  network: N;
  socket: Socket;
  connect(): void;
  server: IServer<N>;
  isConnected(): boolean;
  disconnected(): boolean;
  dispose(message?: string): void;
}

export interface IConnectionOptions {}
