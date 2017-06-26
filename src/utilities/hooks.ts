export const PRE_HOOK  = Symbol('pre');
export const POST_HOOK = Symbol('post');

export class Hook <T extends Object> implements ProxyHandler<T> {
  private _targets: Target = new WeakMap();
  private _protectPrivate: boolean;

  constructor(options: { protectPrivate: boolean } = { protectPrivate: true }) {
    this._protectPrivate = options.protectPrivate;
  }

  get<K extends keyof T>(target: T, event: K, receiver: T): any {
    // this._invariant(event, 'get');

    if (!Reflect.has(target, event)) {
      return this._targetSelf(target, event);
    }

    const original = Reflect.get(target, event);

    if (typeof original !== 'function') { return original; }

    return (...args: any[]) => {
      this._pre(target, event);

      const result = original.call(target, ...args);

      this._post(target, event, result);
    };
  }

  trap() {
    console.log(arguments);
  }

  /**
  * PRIVATE METHODS
  */

  private _setTargetEvent(target: T, event: string): Hook<T> {
    if (this._targets.has(target)) {
      if ((<IEvent>this._targets.get(target))[event]) {
        return this;
      }
    }
    else { this._targets.set(target, {}); }

    (<IEvent>this._targets.get(target))[event] = { [PRE_HOOK]: [], [POST_HOOK]: [] };

    return this;
  }

  private _pre(target: T, event: string, ...args: any[]) {
    return this._handleEvents(
            target,
            this._getEventHandlers(
              target,
              event,
              PRE_HOOK
            ),
            args
          );
  }

  private _post(target: T, event: string, ...args: any[]) {
    return this._handleEvents(
            target,
            this._getEventHandlers(
              target,
              event,
              POST_HOOK
            ),
            args
          );
  }

  private _handleEvents(target: T, events: GeneratorFunction[], args: any[]) {
    for (const handler of events) {
      const result = handler.apply(target, args);

      if (result === false) {
        return function() {
          return result;
        };
      }
    }
  }

  private _getEventHandlers(target: T, event: string, which: symbol): GeneratorFunction[] {
    let result: GeneratorFunction[] = [];

    if (this._targets.has(target)) {
      const events: IEvent = (<IEvent>this._targets.get(target));
      if (events[event]) {
        result = events[event][which];
      }
    }

    return result;
  }

  private _targetSelf(target: T, event: string): () => T {
    try {
      if (!Object.getPrototypeOf(this).hasOwnProperty(event)) {
        return void 0;
      }
    } catch (e) {
      console.log(`warn: ProxyError: An error occurred when targeting self: ${ e.message }`);
      return void 0;
    }

    return (...args: any[]): T => {
      return (<any>this)[event](target, ...args);
    };
  }

  private _registerPre(target: T, event: string, handler: GeneratorFunction): T {
    this._setTargetEvent(target, event);
    this._getEventHandlers(target, event, PRE_HOOK).push(handler);
    return target;
  }

  private _registerPost(target: T, event: string, handler: GeneratorFunction): T {
    this._setTargetEvent(target, event);
    this._getEventHandlers(target, event, POST_HOOK).push(handler);
    return target;
  }

  private _invariant(key: string, action: string): void {
    if (this._protectPrivate && key[0] === '_') {
      throw new TypeError(`Invalid attempt to ${action} private "${key}" property`);
    }
  }
}

export interface IHandlers {
  [which: string]: GeneratorFunction[];
}

export interface IEvent {
  [event: string]: IHandlers;
}

export type Target = WeakMap<any, IEvent>;
