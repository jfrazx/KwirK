
import * as _ from 'lodash';
import { EventEmitter } from './events';


/**
* TODO: use promises or async to fix some of the obvious issues here
*/
namespace Hook {
  /**
  * all registered Hooks
  */
  export const hooks: { [ event: string ]: { [ which: string ]: IHook[] } } = {};
  export const emitter = new EventEmitter();

  const job: Job = { is_busy: false, events: [] };

  export function registerPre( event: string, hook: IHook ): boolean {
    return register( event, hook, true );
  }

  export function registerPost( event: string, hook: IHook ): boolean {
    return register( event, hook, false );
  }

  export function register( event: string, hook: IHook, pre: boolean ): boolean {
    const which = pre ? 'pre' : 'post';

    if ( !hook.reference || !hook.reference.trim().length )
      return false; // fail in this fashion ?

    if ( exists( event, which, hook.reference ) )
      return false;

    if ( !hooks[ event ] )
      hooks[ event ] = {};

    if ( !hooks[ event ][ which ] )
      hooks[ event ][ which ] = [];

    hooks[ event ][ which ].push( hook );

    return true;
  }

  export function exists( event: string, which: string, reference: string ): boolean {
    if ( !hooks[ event ] || !hooks[ event ][ which ] )
      return false;

    return !!_.find( hooks[ event ][ which ], ( hook: IHook ) => {
      return hook.reference === reference;
    });
  }

  export function deregisterEvent( event: string ): void {
    if ( isBusy( arguments ) ) { return; }
    delete hooks[ event ];
  }

  export function deregisterPre( event: string ): void {
    if ( hooks[ event ] ) {
      if ( isBusy( arguments ) ) { return; }
      delete hooks[ event ][ 'pre' ];
    }
  }

  export function deregisterPost( event: string ): void {
    if ( hooks[ event ] ) {
      if ( isBusy( arguments ) ) { return; }
      delete hooks[ event ][ 'post' ];
    }
  }

  export function deregister( event: string, reference: string, pre: boolean = true ) {
    let which = pre ? 'pre' : 'post';

    if ( hooks[ event ] && hooks[ event ][ which ] ) {
      if ( isBusy( arguments ) ) { return; }

      _.remove( hooks[ event ][ which ], ( hook: IHook ) => {
        return hook.reference === reference;
      });
    }
  }

  export function pre( event: string, context: any, ...args: any[] ): void {
    if ( hooks[ event ] && hooks[ event ][ 'pre' ] ) {
      call( event, hooks[ event ][ 'pre' ], context, args );
    }
  }

  export function post( event: string, context: any, ...args: any[] ): void {
    if ( hooks[ event ] && hooks[ event ][ 'post' ] ) {
      call( event, hooks[ event ][ 'post' ], context, args );
    }
  }

  function isBusy( ...args: any[] ): boolean {
    if ( job.is_busy && _.includes( job.events, args[ 0 ] ) ) {
      setTimeout( isBusy.caller.apply( Hook, args ), 1000 );
      return true;
    }
    return false;
  }

  /**
  * Call a Hook
  *
  * @param <String> event: The event that is being called
  * @param <IHook[]> collection: An array of Hooks for the above event
  * @param <any> context: The context in which the Hooks should be called
  * @param <any[]> args: Any arguments to send to the Hook
  * @return <void>
  * @api private
  */
  function call( event: string, collection: IHook[], context: any, args: any[] ): void {
    job.events.push( event );

    for ( let i = 0; i < collection.length; i++ ) {
      job.is_busy = true;
      const hook = collection[ i ];
      try {
        // use custom or passed context/args ?
        context = hook.context === undefined ? context : hook.context;
        args    = hook.args === undefined ? args : hook.args;

        // call the callback
        if ( typeof hook.callback === 'function' ) {
          args.push( function next( err?: Error, ...results: any[] ){
            if ( err ) {
              if ( !hook.ignoreErrors ) {
                emitter.emit( 'error::' + event + '::' + hook.reference, err );
                return;
              }
            }

            // emit after the callback function, possibly handy for custom emits for an event or to signify the hook has been called
            if ( hook.emit && hook.emit.trim().length ) {
              emitter.emit( hook.emit, results );
            }
          });
          hook.callback.apply( context, args );
        }

          // if we just want a custom emit before/after an event...
          if ( hook.emit && hook.emit.trim().length  && ( typeof hook.callback !== 'function' ))
            emitter.emit( hook.emit, args );

      }
      catch ( e ) {
        if ( !hook.ignoreErrors ) {
          unbusy( event );
          throw e; // hmm..?
        }
      }

      unbusy( event );
    }

    function defaults(): IHook {
      return {
        reference: null,
        callback: null,
        ignoreErrors: false,
        emit: null,
        context: Hook,
        args: null
      };
    }

    /**
    * Mark Hooks as not being busy and remove the no longer busy event
    *
    * @param <String> event: The no longer buys event
    * @return <void>
    */
    function unbusy( event: string ): void {
      job.is_busy = false;

      job.events = _.difference( job.events, [ event ] );
    }
  }

  export interface Job {
    is_busy: boolean;
    events: string[];
  }

  export interface IHook {
    reference: string;
    callback?: Function;
    ignoreErrors?: boolean;
    emit?: string;
    context?: any;
    args?: any;
  }
}

export = Hook;
