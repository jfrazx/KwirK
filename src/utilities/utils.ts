import * as _ from 'lodash';

export function defaults<T>(options: T, values: T): T {
  return _.defaults(options, values);
}

// export function toSeconds(int: number, from = 'milliseconds'): number {
//   int /= 60;
// }

export function inRange(value: number, min: number, max: number): boolean {
  return value >= Math.min(min, max) && value < Math.max(min, max);
}

export function isInteger(possibleNumber: any): boolean {
  return (
    typeof possibleNumber === 'number' &&
    isFinite(possibleNumber) &&
    Math.floor(possibleNumber) === possibleNumber
  );
}
