import { ITarget } from './target.interface';

export interface IUser<N> extends IUserOptions, ITarget {
  network: N;
}

export interface IUserOptions {
  name: string;
}
