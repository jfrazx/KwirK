
import { AnyNet, IAnyNet, NetFactory } from './networks/netfactory';
import { Network } from './networks/base/network';
import { EventEmitter } from './utilities/events';
import { Server } from './networks/base/server';
import { Logger } from './utilities/logger';
import { Router } from './messaging/router';
import { Timer } from './utilities/timer';
var Color = require( './utilities/color' );
import * as _ from 'lodash';

export class Bot extends EventEmitter implements IBot {

    public network: { [ network: string ]: AnyNet } = {};
    public timers: { [ network: string ]: Timer[] } = {};
    public Logger = Logger;
    public router: Router;
    public Timer = Timer;

    constructor( config: IAnyNet = {} ) {
      super();

      this.setMaxListeners( 0 );

      // for now, eventually we will daemonize2
      process.on( 'SIGINT',  () => {
        this.quit( () => {
          process.exit( 0 );
        });
      });

      this.setupListeners();

      this.router = new Router( this );
    }

    /**
    * Start all the networks, or just one
    * @param <AnyNet> network: The single network that you want to start
    * @return <void>
    */
    public start( network?: AnyNet ): void {
      if ( network ) {
        if ( network instanceof Network ) {

          if ( !this.network[ network.name ] )
            this.network[ network.name ] = network;

          return network.connect();
        } else {
          // should I throw or just log, emit and ignore ?
          throw new Error( ( typeof network ) + ' is not an instance of a known network' );
        }
      }

      // no networks?
      if ( !( _.keys( this.network ).length )) {
        this.emit( 'error', new Error( 'no networks available' ) );
        return;
      }

      for ( let name in this.network ) {
        if ( !this.network[ name ].enabled() || this.network[ name ].connected() )
          continue;
        this.network[ name ].connect();
      }
    }

    /**
    * Add a new network to the bot
    * @param <IAnyNet> netinfo: The network configuration information
    * @param <Function> callback: Optional callback to perform after network add
    * <> @param <Error> err: Error to return or null
    * <> @param <AnyNet> network: The newly created network object
    * @return <Bot>
    */
    public addNetwork( nets: AnyNet, callback?: Function ): Bot;
    public addNetwork( netinfo: IAnyNet, callback?: Function ): Bot;
    public addNetwork( netinfo: any, callback?: Function ): Bot {
      var network: AnyNet;
      if ( netinfo instanceof Network )
        network = netinfo;
      else
        network = NetFactory.createNetwork( this, netinfo );


      if ( this.networkExists( network.name ) ) {
        var err = new Error( 'network ' + network.name + ' already exists' );

        this.emit( 'error', err, 'addNetwork' );

        if ( callback ) {
          callback( err, network );
          return this;
        }
        else
          throw err;
      }

      this.network[ network.name ] = network;

      if ( callback )
        callback( null, network );

      return this;
    }

    /**
    * Retrieve a network based on its name
    * @param <string> name: The name of the network to find
    * @return <AnyNet>
    */
    public getNetwork( name: string ): AnyNet {
      return _.find( this.network , ( netname: string, network: AnyNet ) => {
        return netname == name;
      });
    }

    /**
    * Remove a network from the Networks Array/Object
    * @param <AnyNet> network: The network to remove
    * @return <Bot>
    */
    public removeNetwork( network: AnyNet, callback?: Function ): Bot {
      if ( this.networkExists( network.name ) ) {
        this.emit( 'removing network', network.name );
        this.Logger.info( 'Removing network ' + network.name );

        this.clearTimers( network.name );

        if ( network.connected() ) {
          this.network[ network.name ].disconnect( ( err?: Error )=> {
            delete this.network[ network.name ];

            if ( err )
              this.emit('error', err, 'removeNetwork' );

            if ( callback )
              callback( err );
          });
        } else { delete this.network[ network.name ]; }

      }

      if ( callback )
        callback( null );

      return this;
    }

    public networkExists( name: AnyNet ): boolean;
    public networkExists( name: string ): boolean;
    public networkExists( name: any ): boolean {
      if ( name instanceof Network ) {
        return !( !_.find( this.network, ( network ) => {
          return network === name;
        }));
      }

      return this.network[ name ] !== undefined;
    }

    /**
    * Clear the timers of a particular network, or all of them
    * @param <string> network: The name of the network to clear timers
    * @return <Bot>
    */
    public clearTimers( network?: string ): Bot {
      if ( network ) {
        if ( this.timers[ network ] ) {
          this.network[ network ].clearTimers();
        }
      }
      else {
        _.each( _.keys( this.network ), ( network ) => {
          this.network[ network ].clearTimers();
        } );
      }

      return this;
    }

    /**
    * Stop a network
    * @param <AnyNet> network: The network to disconnect
    * @param <string> message: The message to send to the network
    * @return <void>
    */
    public stop( network: AnyNet, message?: string ): void {
      this.network[ network.name ].disconnect( message );
    }

    /**
    * Stop all connections and end the program
    * @param <string> message: A string message to send with the disconnect
    * @param <Function> callback: Optional callback
    * @return <void>
    * TODO: end krepl and http as well when implemented
    */
    public quit( callback?: Function ): void;
    public quit( message: string, callback?: Function ): void;
    public quit( message: any, callback?: Function ): void {
      if ( typeof message == 'function' ) {
        callback = message;
        message = undefined;
      }

      this.emit( 'quit', message );

      _.each( _.keys( this.network ), ( network ) => {
        this.stop( this.network[ network ], message );
      });

      callback && callback();
    }

    /**
    * Setup general listeners
    * @return <void>
    * @private
    */
    private setupListeners(): void {
      this.on( 'connect::*', this.onConnect.bind( this ) );
      this.on( 'registered::*', this.onRegistered.bind( this ) );
      this.on( 'disconnect::*', this.onDisconnect.bind( this ) );
      this.on( 'error', this.onError.bind( this ) );
    }

    /**
    * Fired when a network is first connected
    * @param <AnyNet> network: The network that was connected
    * @param <Server> server: The network server that was connected
    * @return <void>
    * @private
    */
    private onConnect( network: AnyNet, server: Server ): void {
      this.Logger.info( `connected to nework ${ network.name } on ${ server.host }${ server.port ? ':' + server.port.toString() : '' }`);
    }

    /**
    * Fired when a network is disconnected
    * @param <AnyNet> network: The network that was disconnected
    * @param <Server> server: The network server that was disconnected
    * @return <void>
    * @private
    */
    private onDisconnect( network: AnyNet, server: Server ): void {
      this.Logger.info( `disconnected from nework ${ network.name } on ${ server.host }${ server.port ? ':' + server.port.toString() : '' }`);
    }

    /**
    * Fired on any error event
    * @param <Error> e: The error object
    * @return <void>
    * @private
    */
    private onError( e: Error ): void {
      this.Logger.error( e.toString() );
    }

    /**
    * Fired when a network is first registered
    * @param <AnyNet> network: The network that was registered
    * @param <Server> server: The network server that was registered
    * @return <void>
    * @private
    */
    private onRegistered( network: AnyNet, server: Server ): void {
      this.Logger.info( `registered nework ${ network.name } on ${ server.host }${ server.port ? ':' + server.port.toString() : '' }`);
    }
  }

export interface IBot {
  network: { [ network: string ]: AnyNet };

  addNetwork( nets: IAnyNet, callback?: Function ): Bot;
  getNetwork( network: string ): AnyNet;
  networkExists( network: AnyNet ): boolean;
  networkExists( name: string ): boolean;
  removeNetwork( network: AnyNet, callback?: Function ): void;

  start( network?: AnyNet ): void;
  stop( network: AnyNet ): void;
  quit( callback?: Function ): void;
  quit( message: string, callback?: Function ): void;
  quit(): void;
}
