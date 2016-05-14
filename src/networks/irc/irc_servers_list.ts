import { IrcServer, IIrcServerOptions } from './irc_server';
import { Irc } from './irc';
import * as _ from 'lodash';

export class IrcServersList {

  private _index = 0;
  private servers: IrcServer[] = [];

  constructor( public network: Irc, _servers: IIrcServerOptions[] = [] ) {

    _.each( _servers, ( server ) => {
      this.addServer( server );
    });

    this.setupListeners();
  }

  /**
  * Add a new IRC Server to servers array
  * @param <IServer> serve: The options for configuring the new server
  * @return <void>
  */
  public addServer( serve: IIrcServerOptions, callback?: Function ): IrcServersList {
    let server = new IrcServer( this.network, serve );

    if ( this.serverExists( server.host ) ) {
      this.network.bot.emit( `server_exists::${ this.network.name }`, this, server );

      if ( callback )
        callback( new Error( 'network server hosts must be unique' ), server );

      return this;
    }

    this.servers.push( server );

    if ( callback )
      callback( null, server );

    return this;
  }

  /**
  * Does the server exist?
  * @param <string|Server> target: The host or Server to check for existence
  * @return <boolean>
  */
  public serverExists( host: IrcServer ): boolean;
  public serverExists( host: string ): boolean;
  public serverExists( host: any ): boolean {
    let instance = host instanceof IrcServer

    return !!_.find( this.servers, ( server )=> {
      return host === ( instance ? server.host : server );
    });
  }

  /**
  * Remove a server using a host
  * @param <String> host: The host to find and subsequently, remove
  * @return <IrcServer>
  */
  public removeServerByHost( host: string ): IrcServer {
    return this.removeServer( _.find( this.servers, ( server ) => {
      return server.host === host;
    }));
  }

  /**
  * Remove a server from the servers array
  * @param <Server> server: The server to remove, assuming it exists
  * @return <IrcServer>
  */
  public removeServer( server: IrcServer ): IrcServer {
    let index: number;

    if( ~(index = this.servers.indexOf( server )) ){

      return this.servers.slice( index, 1 ).pop();

      // if( this.active_server === server ) {
      //   this.active_server = null;
      //   this.network.jump();
      // }
    }
  }

  public enableAll(): void {
    _.each( this.servers, ( server )=> {
      server.enable();
    });
  }

  /**
  * Acquire the next server in the servers array
  * @param <number> index: optional index of server to utilize
  * @return <Server>
  */
  public activeServer( index?: number ): IrcServer {
    var server: IrcServer;

    if( typeof index === 'number' &&
             isFinite( index ) &&
             Math.floor( index ) === index
             && _.inRange( index, 0, this.servers.length ) ) {

      server = this.servers[ index ];

    } else {
      server = this.servers[ this._index ];
      this._index = ( this._index + 1 ) % this.servers.length || 0;
    }

    if ( !server || server.disabled() ) {
      server = this.findEnabled();
    }

    return server;
  }

  /**
  * Find an enabled server
  * @return <Server|undefined>
  */
  private findEnabled(): IrcServer {
    return _.find( this.servers, ( server ) => {
      return server.enabled();
    });
  }

  private setupListeners(): void {
    this.network.bot.on( 'remove_server_by_host::' + this.network.name, this.removeServerByHost.bind( this ));
    this.network.bot.on( 'remove_server::' + this.network.name, this.removeServer.bind( this ));
    this.network.bot.on( 'add_server::' + this.network.name, this.addServer.bind( this ));
  }
}
