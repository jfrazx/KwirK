
import { IrcChannel } from './irc_channel';
import { IRC } from './irc';
import { ITLD } from '../../tld';
import { Bot } from '../../bot';
import { Server } from '../base/server';
import { AnyNet } from '../netfactory';
import * as _ from 'lodash';

export class IrcServer extends Server implements IServer {

  public channels: IrcChannel[] = [];
  public host: string;
  public port: number;
  public ssl: boolean;
  public password: string;
  public location: ITLD;

  private _connection_history: connection_history[] = [];


  constructor( public network: IRC, options: IIrcServerOptions ) {
    super( network, options.host, options.port );

    _.merge( this, _.omit( _.defaults( options, this.defaults() ), [ 'enable' ] ));
    this._enable = options.enable;

    if ( !this.host || !this.host.length )
      throw new Error( 'you must supply a server host' );


    this.bot.on( 'connect::'+ this.network.name +'::'+ this.host, this.onConnect.bind( this ) );
    this.bot.on( 'disconnect::'+ this.network.name +'::'+ this.host, this.onDisconnect.bind( this ) );
  }


  /**
  * Tasks to perform upon connection with this server
  * @param <AnyNet> network: The network that has connected
  * @param <Server> server: The server that has connected
  * @return <void>
  */
  private onConnect( network: AnyNet, server: IrcServer ): void {
    if ( network != this.network || server != this )
      return;

    this._connection_history.push( { connected: Date.now(), disconnected: null } );
    this._connected = true;
  }

  /**
  * Tasks to perform upon disconnect from this server
  * @param <AnyNet> network: The network that has connected
  * @param <Server> server: The server that has connected
  * @return <void>
  */
  private onDisconnect( network: AnyNet, server: IrcServer ): void {
    if ( network != this.network || server != this )
      return;

    this.bot.Logger.info( 'disconnected from ' + this.host + ' on ' + this.network.name );
    this._connected = false;
    this._connection_history[ this._connection_history.length-1 ].disconnected = Date.now();
  }


  /**
  * Disable this server and jump to next server if connected
  * @return <void>
  */
  public disable(): void {
    this.bot.Logger.info( 'disabling server ' + this.host + ' on ' + this.network.name );

    this._enable = false;

    if ( this.connected() || this.network.active_server == this )
      this.network.jump();
  }

  /**
  * The default server configuration options
  * @return <IServerOptions>
  */
  private defaults(): IIrcServerOptions {
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

export interface IIrcServerOptions extends ServerOptions {
  enable?: boolean;
}

interface ServerOptions {
  host: string;
  port?: number;
  ssl?: boolean;
  password?: string;
  location?: ITLD;
}

interface connection_history  {
  connected: number;
  disconnected: number;
}
