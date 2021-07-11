export interface ITarget {
  name: string;
  dispose(): void;
  toString(): string;
  say(message: string, force?: boolean): void;
  send(message: string, force?: boolean): void;
  action(message: string, force?: boolean): void;
  notice(message: string, force?: boolean): void;
}
