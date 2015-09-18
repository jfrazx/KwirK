
import { AnyNet, IAnyNet, NetFactory } from './networks/netfactory';
import { Network } from './networks/network';
import { EventEmitter } from './utilities/events';
import { Logger } from './utilities/logger';
import * as _ from 'lodash';


export class Bot extends EventEmitter implements IBot {

    public network: { [ network: string ]: AnyNet } = {};
    public Logger = Logger;

    constructor( public config: IAnyNet = {} ) {
      super( { wildcard: true } );

      this.setMaxListeners( 0 );
      // assign defaults
      // this.config.defaults = this.config.defaults ? _.defaults( this.config.defaults, this.defaults() ) : this.defaults();

      // assign network default values and add network to array
      // _.each( this.config.networks, ( network: IBotNetworkConfiguration, index: any ) => {
      //
      //   network.options = network.options ? _.defaults( network.options, this.config.defaults ) : this.config.defaults;
      //
      //   this.config.networks[ index ] = network;
      //
      //   this.addNetwork( network );
      // });

    }

    /**
    * Start all the networks, or just one
    *
    * @param <AnyNet> network: The single network that you want to start
    * @return <void>
    */
    public start( network?: AnyNet ): void {
      if ( network ) {
        if ( network instanceof Network ) {

          // should we make sure it's in the object?
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
        this.emit( 'error', new Error( 'no networks available' ), this );
        this.Logger.warn( 'no networks available' );
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
    *
    * @param <IAnyNet> netinfo: The network configuration information
    * @param <Function> callback: Optional callback to perform after network add
    * <> @param <Error> err: Error to return or null
    * <> @param <AnyNet> network: The newly created network object
    * @return <void>
    */
    public addNetwork( netinfo: IAnyNet, callback?: Function ): void {
      var network = NetFactory.createNetwork( this, netinfo );

      if ( this.networkExists( network.name ) ) {
        var err = new Error( 'network ' + network.name + ' already exists' );

        this.emit( 'error', err, 'addNetwork' );

        if ( callback )
          return callback( err, network );
        else
          throw err;
      }

      this.network[ network.name ] = network;

      if ( callback ) { callback( null, network ); }
    }

    /**
    * Remove a network from the Networks Array/Object
    * @param <AnyNet> network: The network to remove
    */
    public removeNetwork( network: AnyNet, callback?: Function ): void {
      if ( this.networkExists( network.name ) ) {
        this.emit( 'removing network', network.name );
        this.Logger.info( 'Removing network ' + network.name );

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

      if( callback )
        callback( null );
    }

    public networkExists( name: AnyNet ): boolean;
    public networkExists( name: string ): boolean;
    public networkExists( name: any ): boolean {
      if ( name instanceof Network ) {
        return !( !_.find( this.network, ( network: AnyNet ) => {
          return network === name;
        }))
      } else {
        return this.network[ name ] !== undefined;
      }
    }
  }

export interface IBot {
  network: { [ network: string ]: AnyNet };

  addNetwork( nets: IAnyNet, callback?: Function ): void;
  networkExists( network: AnyNet ): boolean;
  networkExists( name: string ): boolean;
  removeNetwork( network: AnyNet, callback?: Function ): void;

  start( network?: AnyNet ): void;
}
