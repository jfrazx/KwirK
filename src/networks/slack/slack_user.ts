import { IUser, IUserOptions } from '../interfaces';
import { Slack } from './slack';
import { User } from '../base';

export class SlackUser extends User<Slack> implements ISlackUser {
  constructor(network: Slack, options: ISlackUserOptions) {
    super(network, options);
  }

  public action(message: string): void {}

  public dispose(): void {}

  public notice(message: string): void {}

  public say(message: string): void {}

  public send(message: string): void {}
}

export interface ISlackUser extends ISlackUserOptions, IUser<Slack> {}

export interface ISlackUserOptions extends IUserOptions {}
