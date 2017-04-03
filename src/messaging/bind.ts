
import { Network } from '../networks/base/network';
import { AnyNet } from '../networks/netfactory';
import { Message } from './message';
import { Bot } from '../bot';
import * as _ from 'lodash';

export class Bind implements IBind {
  public network: string;
  public channel: string;
  public destination: string;
  public target: string;

  public active: boolean;
  public duplex: boolean;
  public unrestricted: boolean;

  public listen_part: boolean;
  public listen_join: boolean;

  // public prefix_source: boolean;
  public prefix: string;

  public static binds: IBinds = {};

  private accepts: Function[] = [];
  private rejects: Function[] = [];
  private maps: Function[] = [];
  private _prefix_source: boolean;

  constructor( private bot: Bot, opts: BindOptions, inherit: boolean = false ) {

    this.validate( opts );

    this.active = opts.active === undefined ? true : Boolean(opts.active);

    if ( !Bind.binds[ opts.source_network ] )
      Bind.binds[ opts.source_network ] = {
        binds: [],
        enable: this.active
      };

    // if a binding already exists, remove it
    if ( Bind.exists( opts.source_network, opts.source_channel, opts.target_network, opts.target_channel ) ) {
      Bind.removeBind( Bind.find( opts.source_network, opts.source_channel, opts.target_network, opts.target_channel ));
    }

    this.network       = opts.source_network;
    this.channel       = opts.source_channel;
    this.destination   = opts.target_network;
    this.target        = opts.target_channel;

    this.duplex        = opts.duplex === undefined ? true : Boolean(opts.duplex);
    this.unrestricted  = opts.unrestricted === undefined ? true : Boolean(opts.unrestricted);
    this.prefix_source = opts.prefix_source === undefined ? false : Boolean(opts.prefix_source);
    this.prefix        = opts.prefix || this.prefix || '';


    this.bot.Logger.info( `Creating binding for ${ this.network }:${ this.channel } <=> ${ this.destination }:${ this.target }` );

    Bind.binds[ this.network ].binds.push( this );

    // create the opposing bind if it does not exist
    if ( this.duplex && !Bind.exists( this.destination, this.target, this.network, this.channel ) ) {
      this.createOpposing( inherit );
    }
  }

  /**
  * Find the current binds opposing or create it if it does not exist
  * @param <boolean> inherit: Match the existing accepts and rejects and maps
  * @return <Bind>
  */
  public opposing( inherit: boolean = false ): Bind {
    let bind: Bind;
    if ( !( bind = Bind.find( this.destination, this.target, this.network, this.channel ) ))
        bind = this.createOpposing( inherit );

    return bind;
  }

  /**
  * Add a function which may accept a message based on certain criteria
  * @param <Function> callback: The callback
  * @return <Bind>
  */
  public accept( callback: Function ): Bind {
    if ( typeof callback !== 'function' )
      throw new Error( 'You must pass a function to accept' );

    this.accepts.push( callback );

    return this;
  }

  /**
  * Add a function which may reject a message based on certain criteria
  * @param <Function> callback: The callback
  * @return <Bind>
  */
  public reject( callback: Function ): Bind {
    if ( typeof callback !== 'function' )
      throw new Error( 'You must pass a function to reject' );

    this.rejects.push( callback );

    return this;
  }

  /**
  * Add a function which may map message details
  * @param <Function> callback: The callback
  * @return <Bind>
  */
  public map( callback: Function ): Bind {
    if ( typeof callback !== 'function' )
      throw new Error( 'You must pass a function to map' );

    this.maps.push( callback );

    return this;
  }

  /**
  * Match or reject a message based on reject and accept functions
  * @param <Message> message: The message to check
  * @return <Message>
  * @todo return a response object
  */
  public match<N extends Network>( message: Message<N> ): Message<N> {
    let matched: any;
    try {
      if ( matched = _.some( this.rejects, ( callback ) => {
        return callback.call( null, message );
      })) {
        return undefined;
      }

      matched = _.some( this.accepts, ( callback ) => {
        return callback.call( null, message );
      });
    }
    catch ( e ) {
      this.bot.Logger.error( `Bind matching error for ${ this.network }:${ this.channel } <=> ${ this.destination }:${ this.target } : ${ e }` );

      return;
    }

    if ( matched || ( !this.rejects.length && !this.accepts.length ) || this.unrestricted )
      return this.transform( message );
  }

  /**
  * Automatically disables the bind and removes it from the static binds array
  * @return <Bind>
  */
  public release(): Bind {
    this.bot.Logger.info( `Releasing binding for ${ this.network }:${ this.channel } <=> ${ this.destination }:${ this.target }` );

    this.disable();

    Bind.removeBind( this );

    return this;
  }

  /**
  * Enable the bind
  * @param <boolean> other: If true will enable opposing bind as well
  * @return <void>
  */
  public enable( other: boolean = false ): void {
    this.active = true;

    other && this.opposing().enable( false );
  }

  /**
  * Disable the bind
  * @param <boolean> other: If true will disable opposing bind as well
  * @return <void>
  */
  public disable( other: boolean = false ): void {
    this.active = false;

    other && this.opposing().disable( false );
  }

  /**
  * Is this bind enabled?
  * @return <boolean>
  */
  public enabled(): boolean {
    return this.active;
  }

  /**
  * Is this bind disabled?
  * @return <boolean>
  */
  public disabled(): boolean {
    return !this.active;
  }

  get prefix_source(): boolean {
    return this._prefix_source;
  }

  set prefix_source( prefix: boolean ) {
    if ( this.prefix_source && !prefix )
      this.prefix = '';
    else if ( prefix )
      this.prefix = `[${ this.network }::${ this.channel }]`;

    this._prefix_source = prefix;
  }

  /**
  * Create an opposing bind from the current bind
  * @param <boolean> inherit: Match the existing accepts and rejects and maps
  * @return <Bind>
  */
  private createOpposing( inherit: boolean = false ): Bind {
    const bind = new Bind( this.bot, {
      source_network: this.destination,
      source_channel: this.target,
      target_network: this.network,
      target_channel: this.channel,

      active: this.active,
      duplex: this.duplex,
      unrestricted: this.unrestricted,

      prefix_source: this.prefix_source,
      prefix: this.prefix_source ? null : this.prefix,
      listen_join: this.listen_join,
      listen_part: this.listen_part
    });

    if ( inherit ) {
      bind.accepts = Object.assign([], this.accepts);
      bind.rejects = Object.assign([], this.rejects);
      bind.maps    = Object.assign([], this.maps);
    }

    return bind;
  }

  /**
  * Transform a message based on map functions
  * @param <Message> message: The message to transform
  * @return <Message>
  */
  private transform<N extends Network>( message: Message<N> ): Message<N> {
    let msg = Object.create( Object.getPrototypeOf( message ));

    Object.assign(msg, message);

    _.each( this.maps, ( callback ) => {
      callback.call( null, msg );
    });

    return msg;
  }

  private validate( opts: BindOptions ): void {
    [ 'source_network',
      'source_channel',
      'target_network',
      'target_channel'
    ].forEach(prop => {
      if (!opts[prop] || !(<string>opts[prop]).trim()) {
        throw new Error(`a ${ prop.replace(/_/, ' ') } must be defined for binding`);
      }
    });

    if ( opts.source_network === opts.target_network && opts.source_channel === opts.target_channel ) {
      throw new Error( 'the target must not be the source' );
    }
  }

  // TODO
  private setupListeners() {
    if ( this.listen_part ) {

    }

    if ( this.listen_join ) {

    }
  }

  /**
  * Determine if the binding exists
  * @param <string> network: The source network name
  * @param <string> channel: The source channel name
  * @param <string> destination: The target network name
  * @param <string> target: The target networks channel name
  * @return <boolean>
  * @static
  */
  public static exists( network: string, channel: string, destination: string, target: string ): boolean {
    return !!this.find( network, channel, destination, target );
  }

  /**
  * Find the bind from the given parameters
  * @param <string> network: The source network name
  * @param <string> channel: The source channel name
  * @param <string> destination: The target network name
  * @param <string> target: The target networks channel name
  * @return <Bind>
  * @static
  */
  public static find( network: string, channel: string, destination: string, target: string ): Bind {
    if ( this.binds[ network ] ) {
      const bindings = this.binds[ network ].binds;

      for ( const bound of bindings ) {
        if ( bound.channel === channel ) {
          if ( bound.destination === destination ) {
            if ( bound.target === target )
              return bound;
          }
        }
      }
    }
  }

  /**
  * Remove the bind by object or by certain parameters
  * @param <string | Bind> network: The source network name | The bind object to remove
  * @param <string> channel: The source channel name
  * @param <string> destination: The target network name
  * @param <string> target: The target networks channel name
  * @return <void>
  * @static
  */
  public static removeBind( bind: Bind ): Bind;
  public static removeBind( network: string, channel: string, destination: string, target: string ): Bind;
  public static removeBind( network: any, channel?: string, destination?: string, target?: string ): Bind {
    if ( network === undefined ) return;

    if ( network instanceof Bind ) {
      network.bot.Logger.info( `Removing binding for ${ network.network }:${ network.channel } <=> ${ network.destination }:${ network.target }` );

      return this.binds[ network.network ]
                 .binds
                 .splice(
                   this.binds[ network.network ].binds.indexOf(network),
                   1
                  ).pop();
    }

    return this.removeBind( this.find( network, channel, destination, target ));
  }
}


interface IBind extends Options {
  network: string;
  channel: string;
  destination: string;
  target: string;

  match( message: Message<AnyNet> ): Message<AnyNet>;

  opposing( create?: boolean ): Bind;

  accept( callback: Function ): Bind;
  reject( callback: Function ): Bind;
  map( callback: Function ): Bind;

  enabled(): boolean;
  disabled(): boolean;
  enable( other?: boolean ): void;
  disable( other?: boolean ): void;

  release(): Bind;
}

export interface BindOptions extends IBindOptions {
  [key: string]: any;
  source_network: string;
}

export interface IBindOptions extends Options {
  source_channel: string;
  target_network: string;
  target_channel: string;
  listen_join?: boolean;
  listen_part?: boolean;
}

interface Options {
  active?: boolean;
  duplex?: boolean;
  unrestricted?: boolean;

  prefix_source?: boolean;
  prefix?: string;
}

export interface IBinds {
  [network: string]: {
      binds: Bind[],
      enable: boolean
  };
}
