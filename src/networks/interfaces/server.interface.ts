import { INetwork } from './network.interface';

export interface IServer<N extends INetwork> extends IServerOptions {
  network: N;

  connected(): boolean;
  disable(): void;
  disabled(): boolean;
  disconnected(): void;
  dispose(): void;
  enable(): void;
  enabled(): boolean;
}

export interface IServerOptions {
  host: string;
  port?: number;
}
