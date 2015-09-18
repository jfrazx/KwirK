
import { Channel } from './channel';
import { User } from './user';
import { Network } from '../network';
import { Bot } from '../../bot';

export module Helpers {

  export function Channel( channel: Channel, network?: string ): Channel;
  export function Channel( channel: string, network?: string ): Channel;
  export function Channel( channel: any, network?: string ): Channel {
    if ( channel instanceof Channel )
      return channel;


    // if ( this instanceof Bot )
    //   return _.find( _.keys( this.network ) )
    //
    // return _.find( this.channels, ( chan )=> {
    //   return chan.channel === channel;
    // });
  }
}
