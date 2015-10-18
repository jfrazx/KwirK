/**
* An example of how to setup network channel binding with 3 different IRC networks
*/

// for now, npm package eventually
var Kwirk = require('../index'),
    bot   = new Kwirk.Bot();

var freenode = {
  type: 'irc',
  name: 'freenode',
  nick: 'kwirk',
  servers:
  [
    {
      host: 'bradbury.freenode.net',
      enable: false
    },
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
  channels: [{
    name: '#kwirk',
  },
  {
    name: '#someotherchannel',
  }]
};

var efnet = {
  type: 'irc',
  name: 'efnet',
  servers: [
    {
      host: 'efnet.port80.se',
    },
    {
      host: 'irc.swepipe.se',
    }
  ],
  channels: [
    {
      name: '#kwirk-e',
    }
  ],
  nick: 'KwirKBot'
};

var undernet = {
  type: 'irc',
  name: 'undernet',
  servers: [{
    host: 'Chicago.IL.US.Undernet.org',
    enable: true
  }],
  channels: [{
    name: '#kwirk'
  }],
  use_ping_timer: true // default is false
};

bot.addNetwork( freenode )
   .addNetwork( efnet, function( err, network ) {
     if ( err ) {
       return console.error( err );
     }

     network.bind({
       source_channel: '#kwirk-e',
       target_network: 'freenode',
       target_channel: '#kwirk',
       // the opposing bind will not be created
       duplex: false
     })
     // reject based on criteria, in this case, possibly command triggers !command
     .reject( function( message ) {
       return message.message && message.message.match(/^\+?!\w+/);
     })
     // create the opposing bind, a true parameter will create it with the current binds reject, accept and maps
     .opposing( true )
     // accept Message based on criteria, all joins and parts will be accepted
     .accept( function( message ) {
       return !!message.command.match( /^JOIN|PART$/i );
     })
     // chain methods, all messages from user 'Nick', minus any above rejections
     .accept( function( message ) {
       return message.nick == 'Nick';
     })
     // with false only matched accepts (see above) will get through
     .unrestricted = false;
   })
   .addNetwork( undernet, function( err, network ) {
     if ( err ) {
       return console.error( err );
     }

     network.addServer({

       host: 'Bucharest.RO.EU.Undernet.Org'

     }, function( err, server ) {
       if ( err ) {
         return console.error( err );
       }

       server.disable();

     }).addChannel( { name: '#mysuperchannel' });

     network.bind({
       source_channel: '#kwirk',
       target_network: 'efnet',
       target_channel: '#kwirk-e',
       prefix_source: true
     })
     // reject messages based on criteria
     .reject( function( message ) {
       return message.nick === 'loudmouth';
     });
   }
);

// the source network of the bind
bot.network[ 'freenode' ]
  .bind( {
    // the source channel of the bind
    source_channel: '#kwirk', // <-- required
    // target network of the bind
    target_network: 'undernet', // <-- required
    // target channel of the bind
    target_channel: '#kwirk', // <-- required
    // a `true` value will allow the opposing bind to be automatically created with the same criteria
    duplex: true, // <-- true is default
    // a `true` value will allow all messages that are not explicitly ignored to pass
    unrestricted: true, // <-- true is default
    // a `true` value will prefix any message with '[source_network::source_channel]'
    prefix_source: false, // <-- default is false
    // define a custom prefix, will be used, even if prefix_source is true
    prefix: "\\freenode/", // <-- default is ''

})
// get the current binds opposing binding, created if it does not exist
.opposing()

// transform the Message in some way, possibly good for filtering profanity
.map( function( message ) {
  message.message = message.message + ' TRANSFORMED!!';
})
.map( function( message ) {
  message.message = message.message + " TWICE!!";
})
.prefix = "\\undernet/";

// lets get this pary started
bot.start();

/**
* Upon starting the bot you should see something similar to this (and much more):
* info: Creating binding for efnet:#kwirk-e <=> freenode:#kwirk
* info: Creating binding for freenode:#kwirk <=> efnet:#kwirk-e
* info: Creating binding for undernet:#kwirk <=> efnet:#kwirk-e
* info: Creating binding for efnet:#kwirk-e <=> undernet:#kwirk
* info: Creating binding for freenode:#kwirk <=> undernet:#kwirk
* info: Creating binding for undernet:#kwirk <=> freenode:#kwirk
*/


setTimeout( function() {
  bot.quit();
}, 300000 );
