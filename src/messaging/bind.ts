
import { Bot } from '../bot';

export class Bind implements IBind {
  public network: string;
  public channel: string;
  public destination: string;
  public target: string;
  public active: boolean;
  public accept: RegExp[];
  public accept_users: string[];
  public ignore: RegExp[];
  public ignore_users: string[];
  public duplex: boolean;
  public unrestricted: boolean;
  public user_restrict: boolean;
  public prefix_source: boolean;
  public prefix: string;

  public static binds: IBinds = {};

  constructor( private bot: Bot, opts: BindOptions ) {

    [ 'source_network',
      'source_channel',
      'target_network',
      'target_channel'
    ].forEach( ( prop ) => {
      if ( opts[ prop ] === undefined || !opts[ prop ].trim().length )
        throw new Error( `a ${ prop.replace( /_/, ' ' ) } must be defined for binding` );
    });

    this.active = opts.active == undefined ? true : !!opts.active;

    if ( !Bind.binds[ opts.source_network ] )
      Bind.binds[ opts.source_network ] = {
        binds: [],
        enable: this.active
      };

    // if a binding already exists, remove it
    if ( Bind.bindExists( opts.source_network, opts.source_channel, opts.target_network, opts.target_channel ) ) {
      Bind.removeBind( Bind.findBind( opts.source_network, opts.source_channel, opts.target_network, opts.target_channel ));
    }

    this.network       = opts.source_network;
    this.channel       = opts.source_channel;
    this.destination   = opts.target_network;
    this.target        = opts.target_channel;
    this.accept        = this.conditionals( opts.accept );
    this.accept_users  = opts.accept_users || [];
    this.ignore        = this.conditionals( opts.ignore );
    this.ignore_users  = opts.ignore_users || [];
    this.duplex        = opts.duplex === undefined ? true : !!opts.duplex;
    this.unrestricted  = opts.unrestricted === undefined ? true : !!opts.unrestricted;
    this.prefix_source = opts.prefix_source === undefined ? false : !!opts.prefix_source;
    this.prefix        = opts.prefix || ( this.prefix_source ? `[${ this.network.toUpperCase() }::${ this.channel.toUpperCase() }]` : '' );
    this.user_restrict = opts.user_restrict === undefined ? !!this.accept_users.length : !!opts.user_restrict;


    this.bot.Logger.info( `Creating binding for ${ this.network }:${ this.channel } <=> ${ this.destination }:${ this.target }` );

    Bind.binds[ this.network ].binds.push( this );

    // create the opposing bind if it does not exist
    if ( this.duplex && !Bind.bindExists( this.destination, this.target, this.network, this.channel ) ) {
      new Bind( bot, {
          source_network: this.destination,
          source_channel: this.target,
          target_network: this.network,
          target_channel: this.channel,
          active: this.active,
          accept: opts.accept,
          accept_users: this.accept_users,
          ignore: opts.ignore,
          ignore_users: this.ignore_users,
          duplex: this.duplex,
          unrestricted: this.unrestricted,
          user_restrict: this.user_restrict,
          prefix_source: this.prefix_source,
          prefix: this.prefix
        }
      );
    }
  }

  /**
  * Find the current binds opposite
  * @return <Bind>
  */
  public opposite(): Bind {
    return Bind.findBind( this.destination, this.target, this.network, this.channel );
  }

  /**
  * Match a message against the ignore/accept RegExp arrays
  * @param <string> message: The message to try and match
  * @return <boolean | RegExpExecArray>
  */
  public match( message: string ): RegExpExecArray {
    if ( !message ) return;

    for ( let reg in this.ignore ) {
      if ( this.ignore[ reg ].exec( message ) ) {
        this.bot.Logger.info( `Ignoring message '${ message }' matching ${ this.ignore[ reg ] }` );
        return;
      }
    };

    for ( let reg in this.accept ) {
      let match: RegExpExecArray;
      if ( match = this.ignore[ reg ].exec( message ) ) {
        this.bot.Logger.info( `Accepting message '${ message }' matching ${ this.accept[ reg ] }` );
        return match;
      }
    }

    if ( this.unrestricted ) {
      this.bot.Logger.info( `Unrestricted message accepted: ${ message }` );
      return /.*/.exec( message );
    }
  }

  /**
  * Helper for turning an array of strings into RegExp
  * @param <string[]> conditions: The array of strings to Transform
  * @return <RegExp[]>
  * @private
  */
  private conditionals( conditions: string[] ): RegExp[] {
    let result: RegExp[] = [];

    if ( !conditions ) return result;

    for ( let condition in conditions ) {
      try {
        result.push( this.toRegExp( conditions[ condition ] ));
      }
      catch ( e ) {
        this.bot.Logger.error( `network ${ this.network } channel ${ this.channel } binding regular expression ${ conditions[ condition ] } creation failed` );
      }
    }

    return result;
  }

  /**
  * Create a regular expression from a string
  * @param <string | RegExp> reg: The string to turn into a RegExp
  * @return <RegExp>
  * @private
  */
  private toRegExp( reg: string ): RegExp;
  private toRegExp( reg: RegExp ): RegExp;
  private toRegExp( reg: any ): RegExp {
    let flags = reg.toString().replace( /.*\/([gimy]*)$/, '$1' );
    let pattern = reg.toString().replace( new RegExp( '^/(.*?)/'+flags+'$' ), '$1' );
    return new RegExp( pattern, flags );
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
  public static bindExists( network: string, channel: string, destination: string, target: string ): boolean {
    return !!this.findBind( network, channel, destination, target );
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
  public static findBind( network: string, channel: string, destination: string, target: string ): Bind {
    if ( this.binds[ network ] ) {
      let bindings = this.binds[ network ].binds;

      for ( let bind in bindings ) {
        if ( bindings[ bind ].channel === channel ) {
          if ( bindings[ bind ].destination === destination ) {
            if ( bindings[ bind ].target === target )
              return bindings[ bind ];
          }
        }
      }
    }

    return;
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
  public static removeBind( bind: Bind ): void;
  public static removeBind( network: string, channel: string, destination: string, target: string ): void;
  public static removeBind( network: any, channel?: string, destination?: string, target?: string ): void {
    if ( network === undefined ) return;

    if ( network instanceof Bind ) {
      network.bot.Logger.info( `Removing binding for ${ network }:${ channel } <=> ${ destination }:${ target }` );

      this.binds[ network.network ].binds.splice( network, 1 );
    }
    else {
      return this.removeBind( this.findBind( network, channel, destination, target ));
    }
  }
}


interface IBind {
  network: string;
  channel: string;
  destination: string;
  target: string;
  active: boolean;
  accept: RegExp[];
  accept_users: string[];
  ignore: RegExp[];
  ignore_users: string[];
  duplex: boolean;
  unrestricted: boolean;
  user_restrict?: boolean;
  prefix_source: boolean;
  prefix: string;

  match( message: string ): RegExpExecArray;
  opposite(): Bind;
}

export interface BindOptions extends IBindOptions {
  source_network: string
}

export interface IBindOptions {
  source_channel: string,
  target_network: string,
  target_channel: string,
  active?: boolean,
  accept?: string[],
  accept_users?: string[],
  ignore?: string[],
  ignore_users?: string[],
  duplex?: boolean,
  unrestricted?: boolean,
  user_restrict?: boolean,
  prefix_source?: boolean,
  prefix?: string,
}

export interface IBinds {
  [ network: string ]: {
      binds: Bind[],
      enable: boolean
  }
}
