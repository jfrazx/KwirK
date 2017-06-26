
/**
* An example of a very basic IRC bot
*/

const Kwirk = require('../dist/index')
  , bot   = new Kwirk.Bot();

bot.addNetwork({
  type: 'irc',
  name: 'freenode',
  servers: [{
    host: 'chat.freenode.net'
  }],
  channels: [{
    name: '#kwirk'
  }]
}).start();


setTimeout(function() {
  bot.quit( 'The end of the basic KwirK IRC Bot DEMO' );
}, 60000);
