
import { AnyNet } from '../networks/netfactory';
import * as _ from 'lodash';

export class Timer implements ITimer {
  public autoStart: boolean;
  public blocking: boolean;
  public ignoreErrors: boolean;
  public immediate: boolean;
  public interval: number;
  public infinite: boolean;
  public countdown: number;
  public executions: number = 0;
  public errors: Error[] = [];
  public reference: string;

  // stop the timer on event w/ callback
  public stopOn: string;
  public stopCallback: Function;

  // start the timer on event w/ callback
  public startOn: string;
  public startCallback: Function;

  // restart the timer on event w/ callback
  public restartOn: string;
  public restartCallback: Function;

  public emitLevel: number;

  public busy: boolean;
  public timer: any; // import Node Timer Object?
  public callback: Function;

  private _countdown: number;
  private LEVEL: { [ level: string ]:  string };
  private start_wait: number = 0;


  constructor( network: AnyNet, options: ITimerOptions, callback: ( done: Function ) => void );
  constructor( network: AnyNet,  callback: ( done: Function ) => void );
  constructor( public network: AnyNet, options?: any, callback?: ( done: Function ) => void ) {

    if ( typeof options === 'function' ) {
        callback = options;
        options = {};
    }

    this.blocking = options.blocking === undefined ? true : options.blocking;
    this.interval = ( typeof options.interval === 'number'
                        && isFinite( options.interval )
                        && Math.floor( options.interval ) === options.interval )
                        ? options.interval : 3000;

    this.autoStart = !( !options.autoStart );
    this.immediate = !( !options.immediate );

    this.ignoreErrors = !( !options.ignoreErrors );

    this.infinite = options.infinite === undefined ? true : options.infinite;
    this.countdown = ( options.countdown && options.countdown > 1 ) ? Math.floor( options.countdown ) : 1;

    this.reference = ( options.reference && options.reference.trim().length )  ? options.reference : 'timer';

    this.stopOn = ( options.stopOn && options.stopOn.trim().length )  ? options.stopOn : null;
    this.stopCallback = ( typeof options.stopCallback === 'function' ) ? options.stopCallback : null;

    this.startOn = ( options.startOn && options.startOn.trim().length )  ? options.startOn : null;
    this.startCallback = ( typeof options.startCallback === 'function' ) ? options.startCallback : null;

    this.restartOn = ( options.restartOn && options.restartOn.trim().length )  ? options.restartOn : null;
    this.restartCallback = ( typeof options.restartCallback === 'function' ) ? options.restartCallback : null;


    this.timer = null;
    this.busy  = false;

    this.callback = callback;

    /**
    * Emit level
    * @default <number> 1
    * 0: disabled
    * 1: job<task>
    * 2: job<task> + <network name>
    * 3: job<task> + <network name> + <timer reference>
    * 4: job<task> + <timer reference>
    */
    this.emitLevel = ( typeof options.emitLevel === 'number'
                        && isFinite( options.emitLevel )
                        && Math.floor( options.emitLevel ) === options.emitLevel
                        && _.inRange( options.emitLevel, 0, 5 ) )
                        ? options.emitLevel : 1;
    this.LEVEL = {
      1: '',
      2: ' ' + this.network.name,
      3: ' ' + this.network.name + ' ' + this.reference,
      4: ' ' + this.reference
    };

    // keep track of original so we can reassign if the timer gets restarted
    this._countdown = this.countdown;

    var that = this;

    // do we want the timer to listen for and stop on a particular event?
    if ( this.stopOn ) {
      this.network.bot.on( this.stopOn, function() {
        that.stop();

          // callback to perform if the stop on event fires
          if ( that.stopCallback )
            that.stopCallback();
      });
    }


    /**
    * Start the timer on event
    * @note callback only fires if the timer was not running
    */
    if ( this.startOn ) {
      this.network.bot.on( this.startOn, function() {
        if ( that.stopped() ) {
          that.start();

          if ( that.startCallback )
            that.startCallback();
        }
      });
    }

    /**
    * Restart the timer on event
    * @note callback only fires if the timer was not running
    */
    if ( this.restartOn ) {
      this.network.bot.on( this.restartOn, function() {
        if ( that.stopped() ) {
          that.start();

          if ( that.restartCallback )
            that.restartCallback();
        }
      });
    }

    if ( this.autoStart )
      this.start();
  }

  /**
  * Start the timer unless it is already started
  * @return <void>
  */
  public start(): void {
    if ( !this.timer ) {
      this.start_wait = Date.now();

      if ( this.countdown < 1 )
        this.countdown = this._countdown;

      this.timer = setInterval( this.go.bind( this ), this.interval );

      this.network.bot.emit( 'start' + this.LEVEL[ this.emitLevel ] );

      if ( this.immediate )
        this.go();
    }
  }

  /**
  * Is the timer stopped?
  * @return <Boolean>
  */
  public stopped(): boolean {
    return this.timer == null;
  }

  /**
  * Is the timer started?
  * @return <boolean>
  */
  public started() : boolean {
    return !( !this.timer );
  }

  /**
  * Stop the Timer
  * @return <void>
  */
  public stop(): void {
    if ( this.timer ) {
      clearInterval( this.timer );

      if ( this.emitLevel )
        this.network.bot.emit( 'stop' + this.LEVEL[ this.emitLevel ] );

      this.timer = null;
      this.start_wait = 0;
    }
  }

  /**
  * Determine wait time until next execution in milliseconds
  * @return <number>
  **/
  public waitTime(): number {
    if ( !this.start_wait )
      return this.start_wait;

    return this.start_wait + this.interval - Date.now();
  }

  /**
  * Private method to wrap callback function
  * @return <void>
  * @api private
  */
  private go(): void {

    if ( !this.busy || !this.blocking ) {
      this.busy = true;

      if ( this.emitLevel )
        this.network.bot.emit( 'jobstart' + this.LEVEL[ this.emitLevel ] );

      ++this.executions;

      if ( this.callback )
        this.callback( this.done.bind( this ) );

      this.start_wait = Date.now();
    }
  }

  /**
  * Function sent to timer callback, called when finished
  * @param <Error> err: Error object sent back if something went wrong
  * @param <any> args: any additional parameters sent back
  * @return <void>
  * @api private
  */
  private done( err: Error, ...args: any[] ): void {

    if ( this.emitLevel )
      this.network.bot.emit( 'jobstop' + this.LEVEL[ this.emitLevel ], args );

    if ( err ) {
      this.errors.push( err );

      if ( !this.ignoreErrors )
        this.stop();

      this.network.bot.emit( 'joberror' + this.LEVEL[ this.emitLevel ], this.errors );
    }

    if ( !this.infinite ) {

      if ( --this.countdown < 1 ) {
        if ( this.emitLevel )
          this.network.bot.emit( 'jobcomplete' + this.LEVEL[ this.emitLevel ] );

        this.stop();
      }
    }

    this.busy = false;
  }
}

export interface ITimer extends ITimerOptions {
  executions: number;
  errors: Error[];
  busy: boolean;
  timer: any;
  start(): void;
  stop(): void;
  started(): boolean;
  stopped(): boolean;
  waitTime(): number;
}

export interface ITimerOptions {
    autoStart?: boolean;
    blocking?: boolean;
    countdown?: number;
    emitLevel?: number;
    ignoreErrors?: boolean;
    immediate?: boolean;
    interval?: number;
    infinite?: boolean;
    reference?: string;
    stopOn?: string;
    stopCallback?: Function;
    startOn?: string;
    startCallback?: Function;
    restartOn?: string;
    retartCallback?: string;
}
