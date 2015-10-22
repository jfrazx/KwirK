'use strict';

import { AnyNet } from '../netfactory';
import { Bot } from '../../bot';

export abstract class Server implements IServer {

  protected _connected = false;
  protected _enable    = true;

  constructor( public network: AnyNet, public host: string, public port: number ) {

    this.network.bot.Logger.info( `Creating new server on ${ this.network.name } using ${ this.host }` );
  }

  /**
  * Enable this server
  * @return <void>
  */
  public enable(): void {
    this.network.bot.Logger.info( `enabling server ${ this.host } on ${ this.network.name }` );

    this._enable = true;
  }

  /**
  * Disable the server
  * @return <void>
  */
  public abstract disable(): void;

  /**
  * Is this server connected?
  * @return <boolean>
  */
  public connected(): boolean {
    return this._connected;
  }

  /**
  * Is this server disconnected?
  * @return <boolean>
  */
  public disconnected(): boolean {
    return !( this._connected );
  }

  /**
  * Is this server disabled?
  * @return <boolean>
  */
  public disabled(): boolean {
    return !( this._enable );
  }

  /**
  * Is this server enabled?
  * @return <boolean>
  */
  public enabled(): boolean {
    return this._enable;
  }

  public abstract dispose(): void;
}

export interface IServer extends IServerOptions {
  network: AnyNet;

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
