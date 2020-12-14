import { IrcChannel } from './irc_channel';
import { Network } from '../base/network';
import { IrcUser } from './irc_user';
import { Bot } from '../../bot';

// this should be more generic

export namespace Helpers {
  export function Channel(channel: IrcChannel, network?: string): IrcChannel;
  export function Channel(channel: string, network?: string): IrcChannel;
  export function Channel(channel: any, network?: string): IrcChannel {
    if (channel instanceof Channel) {
      return channel as IrcChannel;
    }

    // if ( this instanceof Bot )
    //   return _.find( _.keys( this.network ) )
    //
    // return _.find( this.channels, ( chan )=> {
    //   return chan.channel === channel;
    // });
  }
}
