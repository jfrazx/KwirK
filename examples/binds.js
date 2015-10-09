/**
* An example of how to setup network channel binding
*/

// for now, npm package eventually
var Kwirk = require('../index'),
    bot   = new Kwirk.Bot();

var freenode = {
  type: 'irc',
  name: 'freenode',
  enable: true,
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
  enable: true,
  reg_listen: 'RPL_ENDOFMOTD',
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
  enable: true,
  name: 'undernet',
  servers: [{
    host: 'Chicago.IL.US.Undernet.org',
    enable: true
  }],
  channels: [{
    name: '#kwirk'
  }],
  use_ping_timer: true
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
       ignore: [/^\+?!\w+/]
     });
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
    // array of RegExp that will allow the message to pass
    accept: [], // <-- [] is default
    // array of RegExp that will cause the message to be ignored
    ignore: ['/profanity/i'], // <-- [] is default
    // a `true` value will allow the opposing bind to be automatically created with the same criteria
    duplex: true, // <-- true is default
    // a `true` value will allow all messages that are not explicitly ignored to pass
    unrestricted: true, // <-- true is default
    // a `true` value will prefix any message with '[source_network::source_channel]'
    prefix_source: false, // <-- default is false
    // define a custom prefix, will be used, even if prefix_source is true
    prefix: "\\freenode/", // <-- default is ''
});

bot.start();
