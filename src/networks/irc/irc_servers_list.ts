import { IrcServer, IIrcServerOptions } from './irc_server';
import * as _ from '../../utilities/lodash';
import { Irc } from './irc';

export class IrcServersList {
  private servers: IrcServer[] = [];
  private _index = 0;

  constructor(public network: Irc, servers: IIrcServerOptions[] = []) {
    servers.forEach((server) => {
      this.addServer(server);
    });

    this.setupListeners();
  }

  /**
   * Add a new IRC Server to servers array
   * @param <IServer> serve: The options for configuring the new server
   * @return <void>
   */
  public addServer(
    serverOptions: IIrcServerOptions,
    callback?: Function,
  ): IrcServersList {
    const server = new IrcServer(this.network, serverOptions);

    this.servers.push(server);

    callback && callback(null, server);

    return this;
  }

  /**
   * Does the server exist?
   * @param <string|Server> target: The host or Server to check for existence
   * @return <boolean>
   */
  public serverExists(host: string | IrcServer): boolean {
    const instance = host instanceof IrcServer;

    return Boolean(
      this.servers.find((server) => host === (instance ? server.host : server)),
    );
  }

  /**
   * Remove a server using a host
   * @param <String> host: The host to find and subsequently, remove
   * @return <IrcServer>
   */
  public removeServerByHost(host: string): IrcServer {
    return this.removeServer(
      this.servers.find((server) => server.host === host),
    );
  }

  /**
   * Remove a server from the servers array
   * @param <Server> server: The server to remove, assuming it exists
   * @return <IrcServer>
   */
  public removeServer(server: IrcServer): IrcServer {
    const index = this.servers.indexOf(server);

    if (~index) {
      return this.servers.slice(index, 1).pop();

      // if( this.active_server === server ) {
      //   this.active_server = null;
      //   this.network.jump();
      // }
    }
  }

  public enableAll(): void {
    this.servers.forEach((server) => server.enable());
  }

  /**
   * Acquire the next server in the servers array
   * @param <number> index: optional index of server to utilize
   * @return <Server>
   */
  public activeServer(index?: number): IrcServer {
    let server = this.nextServer(index);

    if (!server || server.disabled()) {
      server = this.findEnabled();
    }

    return server;
  }

  private nextServer(index: number = this._index): IrcServer {
    index =
      Number.isInteger(index) && _.inRange(index, 0, this.servers.length)
        ? index
        : this._index;

    this._index = (this._index + 1) % this.servers.length || 0;

    return this.servers[index];
  }

  /**
   * Find an enabled server
   * @return <Server|undefined>
   */
  private findEnabled(): IrcServer {
    return this.servers.find((server) => server.enabled());
  }

  private setupListeners(): void {
    this.network.bot.on(
      'remove_server_by_host::' + this.network.name,
      this.removeServerByHost.bind(this),
    );
    this.network.bot.on(
      'remove_server::' + this.network.name,
      this.removeServer.bind(this),
    );
    this.network.bot.on(
      'add_server::' + this.network.name,
      this.addServer.bind(this),
    );
  }
}
