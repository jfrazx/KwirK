
import { Bot } from '../bot';
import { Timer } from '../utilities/timer';

export class Network implements INetwork {

  public Timer = Timer;
  public name: string;
  public connection: any; //for now, will make a generic connection class soon
  public addEventListener: Function;
  public addListener: Function;
  public emit: Function;
  public listeners: Function;
  public listenersAny: Function;
  public many: Function;
  public off: Function;
  public offAny: Function;
  public on: Function;
  public onAny: Function;
  public once: Function;
  public removeListener: Function;
  public removeAllListeners: Function;

  protected _connected: boolean = false;
  protected _enable: boolean;

  constructor( public bot: Bot, name: string ) {

    if ( !name || !name.length )
      throw new Error( 'a network name must be supplied' );

    this.addListener = this.bot.addListener;
    this.on   = this.bot.on;
    this.onAny = this.bot.onAny;
    this.offAny = this.bot.offAny;
    this.many = this.bot.many;
    this.removeListener = this.bot.removeListener;
    this.off = this.bot.off;
    this.removeAllListeners = this.bot.removeAllListeners; // TODO: for that paricular network
    this.listeners = this.bot.listeners;
    this.listenersAny = this.bot.listenersAny;
    this.emit = this.bot.emit;
    this.once = this.bot.once;
  }


  /**
  * Connect to the network
  * @return <void>
  */
  public connect(): void {}

  /**
  * Are we enabled?
  * @return <boolean>
  */
  public enabled(): boolean {
    return this._enable;
  }

  /**
  * Enable the network
  * @return <void>
  */
  public enable(): void {
    this._enable = true;
  }

  /**
  * Disable the network
  * @return <void>
  */
  public disable(): void {
    this._enable = false;

    if ( this.connected() )
      this.disconnect( 'network ' + this.name + ' disabled' );
  }

  /**
  * Are we connected?
  * @return <boolean>
  */
  public connected(): boolean {
    return this._connected;
  }

  /**
  * Disconnect the network
  * @return <void>
  */
  public disconnect(): void;
  public disconnect( callback: Function ): void;
  public disconnect( message: string ): void;
  public disconnect( message: string, callback: Function ): void;
  public disconnect( message?: any, callback?: Function ): void {
    if ( typeof message === 'function' ) {
      callback = message;
      message = undefined;
    }

    if ( !this.connected() ) {
        if ( callback )
          return callback();
    }

    // this.connection.dispose();

    if ( callback )
      callback();
  }

  /**
  * Send a message to a network connection
  *
  * @param <String> message: The message to be sent
  * @return <void>
  */
  public send( message: string ): void {

  }
}

export interface INetwork {
  connection: any;

  connect(): void;
  connected(): boolean;
  disable(): void;
  disconnect( message?: string, callback?: Function ): void;
  // disconnect( callback?: Function ): void;
  enabled(): boolean;
  enable(): void;

  send( message: string ): void;

}

export interface INetOptions {
  /**
  * Should we enable the network? e.g true
  */
  enable?: boolean;
  /**
  * What type of network is this? e.g 'irc' or 'slack'
  */
  type?: string;
}

export interface INetworkOptions {
  /**
  * Network name, e.g freenode
  */
  name?: string;
  /**
  * Bot nickname, e.g KwirK
  */
  nick?: string;
  /**
  * How many times should we attempt to reconnect ( before moving to the next server or disabling )
  */
  connection_attempts?: number;
}
