
import * as events from 'eventemitter2';

export class EventEmitter extends events.EventEmitter2 {
  constructor(config: IEventEmitterConfiguration = { wildcard: true, delimiter: '::' }) {
    super(config);
  }
}

export interface IEventEmitter extends EventEmitter {}

export interface IEventEmitterConfiguration {
    /**
    * use wildcards
   */
    wildcard?: boolean;

    /**
    * the delimiter used to segment namespaces, defaults to `.`.
    */
    delimiter?: string;

    /**
    * if you want to emit the newListener event set to true.
    */
    newListener?: boolean;

    /**
    * max listeners that can be assigned to an event, default 10.
    */
    maxListeners?: number;
}
