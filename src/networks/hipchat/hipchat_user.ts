import { IUser, IUserOptions } from '../interfaces';
import { HipChat } from './hipchat';
import { User } from '../base';

export class HipChatUser extends User<HipChat> implements IHipChatUser {
  constructor(network: HipChat, options: IHipChatUserOptions) {
    super(network, options);
  }

  public action(message: string): void {}

  public dispose(): void {}

  public notice(message: string): void {}

  public say(message: string): void {}

  public send(message: string): void {}
}

export interface IHipChatUser extends IHipChatUserOptions, IUser<HipChat> {}

export interface IHipChatUserOptions extends IUserOptions {}
