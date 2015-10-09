
import { Bind, IBinds, IBindOptions } from '../../messaging/bind';
import { Timer, ITimerOptions } from '../../utilities/timer';
import { AnyNet, IAnyNet } from '../netfactory';
import { Connection } from './connection';
import { Channel } from './channel';
import { Bot } from '../../bot';
import { User } from './user';
import * as _ from 'lodash';

export abstract class Network implements INetwork {

  public name: string;
  public nick: string;
  public Bind: Bind;
  public users: User[] = [];
  public channels: Channel[] = [];
  public channel: { [ chan: string ]: Channel } = {};
  public ident: string;
  public hostname: string;
  public connection: Connection;
  public connection_attempts = 0;

  protected _connected: boolean = false;
  protected _enable: boolean;

  constructor( public bot: Bot, options: IAnyNet ) {
    options = options || {};

    if ( !options.name || !options.name.trim().length )
      throw new Error( 'a network name must be supplied' );

    this.name = options.name.toLowerCase();
    this._enable = !!options.enable;

  }

  public bind( options: IBindOptions ): Bind {
    let opts: any = options;

    opts.source_network = this.name;

    return new Bind( this.bot, opts );
  }

  /**
  * Connect to the network
  * @return <void>
  * @abstract
  */
  public abstract connect(): void;

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
  * @abstract
  */
  public abstract disconnect(): void;
  public abstract disconnect( callback: Function ): void;
  public abstract disconnect( message: string ): void;
  public abstract disconnect( message: string, callback: Function ): void;
  public abstract disconnect( message?: any, callback?: Function ): void;

  /**
  * Send a message to a network connection
  *
  * @param <String> message: The message to be sent
  * @return <void>
  * @abstract
  */
  public abstract send( message: string ): void;

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
    var timer = new this.bot.Timer( <AnyNet> this, options, callback );

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
      this.bot.emit( 'clear_timers::'+ this.name, this );
      _.each( this.bot.timers[ this.name ], ( timer ) => {
        timer.stop();
      });
    }
  }

  public channelExists( name: string ): boolean {
    return !!_.find( this.channels, ( channel ) => {
      return channel.name === name;
    });
  }

  /**
  * Find if the user exists on this network
  * @param <string> name: The name of the user to find
  * @return <boolean>
  */
  public userExists( name: string ): boolean {
    return !!this.findUser( name );
  }

  public findUser( name: string ): User {
    return _.find( this.users, ( user ) => {
      return user.name === name;
    });
  }

  public abstract addUser( name: any ): void;
}

export interface INetwork extends INetworkOptions {
  connection: any;

  bind( options: IBindOptions ): void;
  connect(): void;
  connected(): boolean;
  disable(): void;
  disconnect( message?: string, callback?: Function ): void;

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
  * How many times should we attempt to reconnect ( before moving to the next server or disabling )
  */
  connection_attempts?: number;
}
