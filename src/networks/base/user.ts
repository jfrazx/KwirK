import { INetwork, IUser, IUserOptions } from '../interfaces';
import { Target } from './target';

export abstract class User<N extends INetwork> extends Target implements IUser<N> {
  constructor(public network: N, options: IUserOptions) {
    super(options.name.replace(/[^0-9a-zA-Z\-_.\/]/g, ''));

    this.network.bot.Logger.info(`Creating new user ${this.name} on network ${this.network.name}`);
  }
}
