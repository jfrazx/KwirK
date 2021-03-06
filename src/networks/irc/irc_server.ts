
import { Server, IServer, IServerOptions } from '../base/server';
import { IrcChannel } from './irc_channel';
import { ITLD } from '../../location/tld';
import { AnyNet } from '../netfactory';
import { Bot } from '../../bot';
import { Irc } from './irc';
import * as _ from 'lodash';

export class IrcServer extends Server implements IIRCServer {

  public channels: IrcChannel[] = [];
  public host: string;
  public port: number;
  public ssl: boolean;
  public password: string;
  public location: ITLD;

  private _connection_history: connection_history[] = [];

  constructor( public network: Irc, options: IIrcServerOptions ) {
    super( network, options.host, options.port );

    _.merge( this, _.omit( _.defaults( options, this.defaults() ), [ 'enable' ] ));
    this._enable = options.enable;

    if ( !this.host || !this.host.length )
      throw new Error( 'you must supply a server host' );


    this.network.bot.on( `connect::${ this.network.name }::${ this.host }`, this.onConnect.bind( this ) );
    this.network.bot.on( `disconnect::${ this.network.name }::${ this.host }`, this.onDisconnect.bind( this ) );
  }

  /**
  * @TODO
  */
  public dispose(): void {

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

    this.network.bot.Logger.info( `disconnected from ${ this.host } on ${ this.network.name }` );
    this._connected = false;
    this._connection_history[ this._connection_history.length-1 ].disconnected = Date.now();
  }


  /**
  * Disable this server and jump to next server if connected
  * @return <void>
  */
  public disable(): void {
    this.network.bot.Logger.info( `disabling server ${ this.host }  on ${ this.network.name }` );

    this._enable = false;

    if ( this.connected() && this.network.active_server == this )
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

export interface IIRCServer extends ServerOptions, IServer {

}

export interface IIrcServerOptions extends ServerOptions {
  enable?: boolean;
}

interface ServerOptions extends IServerOptions  {
  host: string;
  ssl?: boolean;
  password?: string;
  location?: ITLD;
}

interface connection_history  {
  connected: number;
  disconnected: number;
}
