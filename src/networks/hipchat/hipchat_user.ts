
import { User, IUser, IUserOptions } from '../base/user';
import { HipChat } from './hipchat';

export class HipChatUser extends User implements IHipChatUser {

  constructor( network: HipChat, options: IHipChatUserOptions ) {
    super( network, options );
  }


  public action( message: string ): void {

  }

  public dispose(): void {

  }

  public notice( message: string ): void {

  }

  public say( message: string ): void {

  }

  public send( message: string ): void {

  }

}

interface IHipChatUser extends IHipChatUserOptions, IUser {

}

export interface IHipChatUserOptions extends IUserOptions {

}
