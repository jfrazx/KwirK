
/**
* An example of a very basic IRC bot
*/

const Kwirk = require('../index')
  , bot   = new Kwirk.Bot();

bot.addNetwork({
  type: 'irc',
  name: 'freenode',
  servers: [{
    host: 'adams.freenode.net'
  }],
  channels: [{
    name: '#kwirk'
  }]
}).start();


setTimeout(function() {
  bot.quit( 'The end of the basic KwirK IRC Bot DEMO' );
}, 60000);
