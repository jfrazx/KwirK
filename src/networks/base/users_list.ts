import { INetwork } from '../interfaces';
import { User } from './user';
import * as _ from 'lodash';

export class UsersList<N extends INetwork, T extends User<N>> implements IUsersList<T, N> {
  private users: { [name: string]: T } = {};

  constructor(public network: N, private User: { new (network: N, options: { name: string }): T }) {}

  public findEnsured(name: string): T {
    let user = this.find(name);

    if (!user) {
      user = this.addUser(new this.User(this.network, { name: name }));
    }

    return user;
  }

  public find(name: string): T {
    return this.users[name];
  }

  public addUser(user: T): T {
    this.users[user.name] = user;
    return user;
  }
}

export interface IUsersList<T, N> {
  network: N;

  find(name: string): T;
  addUser(user: T): T;
  findEnsured(name: string): T;
}
