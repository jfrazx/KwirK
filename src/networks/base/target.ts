import { ITarget } from '../interfaces';

export abstract class Target implements ITarget {
  constructor(public name: string) {
    if (!name || !name.trim().length)
      throw new Error('you must supply a target name');
  }

  public abstract action(message: string, force?: boolean): void;

  public abstract dispose(): void;

  public abstract notice(message: string, force?: boolean): void;

  public abstract say(message: string, force?: boolean): void;
  public abstract send(message: string, force?: boolean): void;

  public toString(): string {
    return this.name;
  }
}
