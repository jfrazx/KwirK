# KwirK

KwirK aims to be a sophisticated, multi-network, multi-protocol utility bot that can
act as a bridge between popular services.

-- THIS PACKAGE IS CONSIDERED ALPHA QUALITY --
-- PLEASE OPEN ISSUES TO REPORT BUGS --

## Goals

- support multiple chat protocols
- IRC is the current focus with Slack and HipChat next on the list
- link channels on the different networks (IRC<->IRC is alpha)
- transparent channel encryption with Diffie-Hellman key exchange
- http administrative front-end and client area
- ability to link multiple bots
- more secure, eggdrop like command console
- plugin system
- translation, in channel, channel to channel, and pm to pm as proxy
- much more, this list will certainly expand

## Installation

npm install kwirk [--save]

or

clone the repo: git clone https://github.com/jfrazx/KwirK/

If you haven't setup your environment:

npm install -g typescript typings

npm install

## Functionality

IRC is mostly stable, but with little other than providing building blocks.
Emitted events will (eventually) be catalogued appropriately. In the interim take a look at the defined IRC Constants (/src/constants/constants.ts)
IRC to IRC binding appears to be working well.

## Example

```javascript
var Kwirk = require('kwirk'),
  bot = new Kwirk.Bot();

var freenode = {
  type: 'irc',
  name: 'freenode',
  servers: [
    {
      host: 'adams.freenode.net',
      port: 7000, // defaults to 6667
      ssl: true, // default to false
      enable: false, // defaults to true
    },
    {
      host: 'asimov.freenode.net',
      port: 7000,
      ssl: true,
    },
  ],
  channels: [
    {
      name: '#bot-playground',
    },
  ],
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
    },
  ],
  channels: [
    {
      name: '#kwirk',
    },
  ],
  nick: 'KwirKBot', // defaults to 'kwirk'
};

var server = {
  host: 'irc.choopa.net',
  port: 9999,
  ssl: true,
};

bot.addNetwork(freenode).addNetwork(efnet, function (err, network) {
  network.addServer(server, function (err, server) {
    server.disable();
  });
});

// this is binding to the efnet network and the #kwirk channel
bot.network['efnet']
  .bind({
    source_channel: '#kwirk',
    // the target will be freenode network and the #bot-playground channel
    target_network: 'freenode',
    target_channel: '#bot-playground',
    prefix_source: true,
  })

  // reject, accept and map will all be passed a message object
  .reject(function (message) {
    return message.content.match(/^\+?!\w+/);
  })
  // opposing bind will be created, true value will inherit rejects, accepts and maps
  .opposing(true).prefix_source = false;

bot.start();
```

## Contributing

1. Fork it ( https://github.com/jfrazx/KwirK/fork )
2. Adhere to naming conventions (transition in progress)

- Indentation is two (2) spaces
- File name to match Object/Class name in lowercase and underscored (irc_server.ts for IrcServer)
- Treat acronyms in object names as words (Irc instead of IRC)
- Variables to be snake case: lowercase, \_ delimited words (my_var)
- Function names to be camelCase, starting with lowercase (myFunction)
- Class names to be PascalCase, starting with uppercase (MyClass)

3. Create your feature branch (git checkout -b my-new-feature)
4. Commit your changes (git commit -am 'Add some feature')
5. Push to the branch (git push origin my-new-feature)
6. Create a new Pull Request (not to master)
