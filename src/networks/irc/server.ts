
import { Channel } from './channel';
import { IRC } from './irc';
import { ITLD } from '../../tld';
import { Bot } from '../../bot';
import { AnyNet } from '../netfactory';
import * as _ from 'lodash';

export class Server implements IServer {

  public channels: Channel[] = [];
  public host: string;
  public port: number;
  public ssl: boolean;
  public password: string;
  public location: ITLD;
  public bot: Bot;

  private _connected = false;
  private _enable: boolean;


  constructor( public network: IRC, options: IServerOptions ){
    this.bot = this.network.bot;

    _.merge( this, _.omit( _.defaults( options, this.defaults() ), [ 'enable' ] ));
    this._enable = options.enable;

    // is this necessary?
    this.bot.on( 'connect', this.onConnect.bind( this ) );

    if ( !this.host || !this.host.length )
      throw new Error( 'you must supply a server host' );

  }

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
  * Tasks to perform upon connection with this server
  * @param <AnyNet> network: The network that has connected
  * @param <Server> server: The server that has connected
  * @return <void>
  */
  public onConnect( network: AnyNet, server: Server ): void {
    if ( network != this.network || server != this )
      return;

    console.log(' connected ', network.name );

    this._connected = true;
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

  /**
  * Disable this server and jump to next server if connected
  * @return <void>
  */
  public disable(): void {
    this._enable = false;

    if ( this.connected() )
      this.network.jump();
  }

  /**
  * Enable this server
  * @return <void>
  */
  public enable(): void {
    this._enable = true;
  }

  private defaults(): IServerOptions {
    return {
      enable: true,
      host: null,
      port: 6667,
      ssl: false,
      password: null,
      location: null
    }
  }
}

export interface IServer extends ServerOptions {
  connected(): boolean;
  enable(): void;
  disable(): void;
  disabled(): boolean;
}

export interface IServerOptions extends ServerOptions {
  enable?: boolean;
}

interface ServerOptions {
  host: string;
  port?: number;
  ssl?: boolean;
  password?: string;
  location?: ITLD;
}
