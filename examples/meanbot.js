
/**
* Demonstrate how to add an event listener for an evil bot
*/

const Kwirk = require( '../index' )
  , bot   = new Kwirk.Bot();

const freenode = {
  type: 'irc',
  name: 'freenode',
  nick: 'kwirk',
  servers:
  [
    {
      host: 'adams.freenode.net',
      port: 7000,
      ssl: true
    },
    {
      host: 'asimov.freenode.net',
      port: 7000,
      ssl: true
    }
  ],
  channels: [
    {
      name: '#kwirk',
    }
  ]
};

const undernet = {
  type: 'irc',
  name: 'undernet',
  servers: [{
    host: 'Chicago.IL.US.Undernet.org',
    enable: true
  }],
  channels: [{
    name: '#kwirk'
  }],
  use_ping_timer: true, // default is false
  /**
  * Can pass seconds or milliseconds, accepted range is 15 seconds - 5 minutes (300 seconds)
  */
  ping_delay: 30000
};

// add network
bot.addNetwork( undernet )
.addNetwork( freenode )
// listen for a message from any network
.on( 'message::*', function( message ) {

  if ( message.content.startsWith('!op') ) {
    if ( message.channel )
      return message.target.op( message.user );
    else
      return message.target.say( 'We are all equals in this realm' );
  }

  // someone joined
  if ( message.join() ) {
    // was it me?
    if ( message.isBot() ) {
      message.target.say( `You can't keep me out!` );
      message.target.action( 'dances in the channel' );
    }
    // or someone else...
    else {
      message.target.say( `Who let ${ message.nick } in here?` );
      message.target.action( `slaps ${ message.nick }` );
    }
  }
  // someone left
  else if ( message.part() ) {
    // no need to check if it's the bot that parted, it will not send to channel if it's not on it
    message.target.say( `Good riddance! We didn't want ${ message.nick } in here anyway!` );
  }
  // or perhaps an action
  else if ( message.action() ) {
    message.target.say( `Is that all you've got?` );

    message.target.action( `out does ${ message.user.name } at their own game, then grooves around the channel` );
  }
  // a channel or private message
  else {
    message.target.say( `All I do is echo what you say ${ message.user.name }: '${ message.content }'  ... irritating isn't it?`);
  }
});

bot.start();
