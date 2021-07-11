/**
 * An example of a very basic IRC bot
 */

import { IrcRule } from '../src/rules';
import { Bot } from '../src/bot';

const bot = new Bot();

bot
  .registerNetworkRule(IrcRule)
  .addNetwork({
    type: 'irc',
    name: 'freenode',
    servers: [
      {
        host: 'chat.freenode.net',
      },
    ],
    channels: [
      // @ts-ignore
      {
        name: '#kwirk',
      },
    ],
  })
  .start();

setTimeout(function () {
  bot.quit('The end of the basic KwirK IRC Bot DEMO');
}, 60000);
