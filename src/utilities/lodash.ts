import * as _ from 'lodash';

declare module 'lodash' {
  interface LoDashStatic {
    any<T>(collection: List<T>, predicate?: ListIterator<T, boolean>): boolean;
  }
}

namespace LoDash {
  export function any<T>(
    collection: List<T>,
    predicate?: ListIterator<T, boolean>,
  ): boolean {
    return _.some(collection, predicate);
  }

  export function isEmptyArray<T>(a: T): boolean {
    return Array.isArray(a) && !a.length;
  }
}

type ListIterator<T, TResult> = (
  value: T,
  index: number,
  collection: List<T>,
) => TResult;

interface List<T> {
  [index: number]: T;
  length: number;
}

_.mixin(
  Object.keys(LoDash).reduce((object, key) => {
    object[key] = (LoDash as any)[key];
    return object;
  }, Object.create(null)),
);

export = _;
