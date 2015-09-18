
# KwirK

KwirK aims to be a sophisticated, multi-network, multi-protocol utility bot that can
act as a bridge between popular services.
This project is in its infancy and has an enormous amount of work to be done before it
can achieve these lofty expectations. Your assistance would be most appreciated.

## Goals

- support multiple chat protocols  
  - IRC is the current focus with Slack and HipChat next on the list  
- link channels on the different networks  
- transparent channel encryption with DiffieHellman key exchange  
- http administrative front-end and client area  
- ability to link multiple bots  
- eggdrop like command console, but not with telnet  
- plugin system  
- much more, this list will certainly expand  

## Installation

Not yet, just clone the repository and play around.

If you haven't setup your environment:

npm install -g typescript tsd

npm install  
tsd install

( the node.d.ts file I'm using is modified, if it gets overwritten... )

## Functionality

The bot, with the below example, will probably connect to the given networks.
Then it will probably join the configured channels, but that is about the
extent of its current capabilities. Not very exciting yet. You should certainly
assist in making it better.

## Example
```
var Kwirk    = require( './index' );
var bot      = new Kwirk.Bot();
var freenode = {
  type: 'irc',
  name: 'freenode',
  enable: true, // defaults to false
  servers: [
    {
      host: 'adams.freenode.net',
      port: 7000,   // defaults to 6667
      ssl: true,    // default to false
      enable: false // defaults to true
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
      modes: [ 'n', 't', 's', 'p' ]
    }
  ]
};

var efnet = {
  type: 'irc',
  name: 'efnet',
  enable: true,
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
      name: '#kwirk',
      modes: [ 'n', 't', 'p' ], // channel modes to enforce
      password: 'mychannelkey', // channel key
      key: 'myencryptionkey'    // encryption key
    }
  ],
  nick: 'KwirKBot',      // defaults to 'kwirk'
  modes: [ 'x', 'i' ],   // defaults to [ 'i' ]
}

bot.addNetwork( freenode );
bot.addNetwork( efnet );

var server = {
  host: 'irc.choopa.net',
  port: 9999,
  ssl: true
};

bot.network[ 'efnet' ].addServer( server );

bot.start();

```
## Contributing

1. Fork it ( https://github.com/jfrazx/KwirK/fork )
2. Create your feature branch (git checkout -b my-new-feature)
3. Commit your changes (git commit -am 'Add some feature')
4. Push to the branch (git push origin my-new-feature)
5. Create a new Pull Request
