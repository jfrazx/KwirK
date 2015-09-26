
import { Bot } from '../../bot';
import { User } from './user';
import { Timer, ITimerOptions } from '../../utilities/timer';
import { Connection } from './connection';
import * as _ from 'lodash';

export class Network implements INetwork {

  public name: string;
  public nick: string;
  public users: User[];
  public connection: Connection;
  connection_attempts = 0;


  protected _connected: boolean = false;
  protected _enable: boolean;

  constructor( public bot: Bot, name: string ) {

    if ( !name || !name.trim().length )
      throw new Error( 'a network name must be supplied' );
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
  public disable(): void {}

  /**
  * Are we connected?
  * @return <boolean>
  */
  public connected(): boolean {
    return this._connected;
  }

  /**
  * Are we disconnected?
  * @return <boolean>
  */
  public disconnected(): boolean {
    return !( this._connected );
  }

  /**
  * Disconnect the network
  * @return <void>
  */
  public disconnect(): void;
  public disconnect( callback: Function ): void;
  public disconnect( message: string ): void;
  public disconnect( message: string, callback: Function ): void;
  public disconnect( message?: any, callback?: Function ): void {}

  /**
  * Send a message to a network connection
  *
  * @param <String> message: The message to be sent
  * @return <void>
  */
  public send( message: string ): void {}

  /**
  * The network to a string
  * @return <String>
  */
  public toString(): string {
    return this.name;
  }

  /**
  * Create Timers and add them to the Bot Timer object
  * @param <ITimerOptions> options: The options for this Timer
  * @param <Function> callback: The timer job to callback
  * @return <Timer>
  */
  public Timer( options: ITimerOptions, callback: ( done: Function )=> void ): Timer {
    var timer = new this.bot.Timer( this, options, callback );

    if ( !this.bot.timers[ this.name ] )
      this.bot.timers[ this.name ] = [];

    this.bot.timers[ this.name ].push( timer );

    return timer;
  }

  /**
  * Clear all timers created for this network
  * @return <void>
  */
  public clearTimers(): void {
    if ( this.bot.timers[ this.name ] ) {
      _.each( this.bot.timers[ this.name ], ( timer ) => {
        timer.stop();
      } );
    }
  }
}

export interface INetwork extends INetworkOptions {
  connection: any;

  connect(): void;
  connected(): boolean;
  disable(): void;
  disconnect( message?: string, callback?: Function ): void;
  // disconnect( callback?: Function ): void;
  enabled(): boolean;
  enable(): void;

  send( message: string ): void;
  toString(): string;

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
