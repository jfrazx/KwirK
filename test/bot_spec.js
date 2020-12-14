
var Kwirk = require('../index');
var assert = require('assert');
var Bot = Kwirk.Bot;
var Network = Kwirk.Network;

describe('Bot', function () {
  describe('configuration', function () {
    it.skip('should have default values applied', function () {

      var bot = new Bot(
        {
          networks: [{
            type: 'irc',
            name: 'freenode',
            enable: false,
            servers: [{
              host: 'bradbury.freenode.net',
              port: 7000,
              ssl: true
            }]
          }]
        }
      );

      assert.equal(bot.config.defaults.encoding, 'utf8');
      assert.equal(bot.config.defaults.nick, 'kwirk');
      assert.equal(bot.config.defaults.altnick, 'kw?rk');
      assert.equal(bot.config.defaults.realname, 'KwirK IRC Bot');
      assert.equal(bot.config.defaults.user, 'KwirK');
      assert.equal(bot.config.defaults.modes.length, 1);
      assert.deepEqual(bot.config.defaults.modes, ['i']);
      assert.equal(bot.config.defaults.owner, '');
      assert.equal(bot.config.defaults.trigger, '!');
      assert.equal(bot.config.defaults.quit_message, 'KwirK, a fancy IRC bot');
    });

    it.skip('should accept assigned default values', function () {
      var bot = new Bot(
        {
          networks: [{
            network: 'freenode',
            enable: false,
            servers: [{
              host: 'bradbury.freenode.net',
              port: 7000,
              ssl: true
            }]
          }],
          defaults: {
            encoding: 'ascii',
            nick: 'KWIRK',
            realname: 'KWIRK IRC BOT',
            user: 'KWIRK',
            modes: ['n', 't'],
            owner: 'KWIRK',
            trigger: '.',
            quit_message: 'KWIRK, A FANCY IRC BOT'
          }
        }
      );

      assert.equal(bot.config.defaults.encoding, 'ascii');
      assert.equal(bot.config.defaults.nick, 'KWIRK');
      assert.equal(bot.config.defaults.realname, 'KWIRK IRC BOT');
      assert.equal(bot.config.defaults.user, 'KWIRK');
      assert.equal(bot.config.defaults.modes.length, 2);
      assert.deepEqual(bot.config.defaults.modes, ['n', 't']);
      assert.equal(bot.config.defaults.owner, 'KWIRK');
      assert.equal(bot.config.defaults.trigger, '.');
      assert.equal(bot.config.defaults.quit_message, 'KWIRK, A FANCY IRC BOT');
    });

    it.skip('should accept values and assign defaults', function () {
      var bot = new Bot(
        {
          networks: [{
            network: 'freenode',
            enable: false,
            servers: [{
              host: 'bradbury.freenode.net',
              port: 7000,
              ssl: true
            }]
          }],
          defaults: {
            realname: 'KWIRK IRC BOT',
            user: 'KWIRK',
            owner: 'KWIRK',
            trigger: '.'
          }
        }
      );

      assert.equal(bot.config.defaults.encoding, 'utf8');
      assert.equal(bot.config.defaults.nick, 'kwirk');
      assert.equal(bot.config.defaults.realname, 'KWIRK IRC BOT');
      assert.equal(bot.config.defaults.user, 'KWIRK');
      assert.equal(bot.config.defaults.modes.length, 1);
      assert.deepEqual(bot.config.defaults.modes, ['i']);
      assert.equal(bot.config.defaults.owner, 'KWIRK');
      assert.equal(bot.config.defaults.trigger, '.');
      assert.equal(bot.config.defaults.quit_message, 'KwirK, a fancy IRC bot');
    });

    it.skip('should have an array of network objects', function () {
      var bot = new Bot(
        {
          networks: [{
            network: 'freenode',
            enable: false,
            servers: [{
              host: 'bradbury.freenode.net',
              port: 7000,
              ssl: true
            }]
          },
          {
            network: 'undernet',
            enable: false,
            servers: [{
              host: 'ix2.undernet.org',
            },
            {
              host: 'chicago.il.us.undernet.org',
              port: 7000,
              ssl: true,
              password: null,
              location: {
                tld: 'us',
                country: 'United States',
                state: 'Illinois',
                city: 'Chicago'
              }
            }
            ]
          }
          ]
        }
      );

      assert.equal(bot.networks.length, 2);

      bot.networks.forEach(function (network) {
        assert.equal(network instanceof Network, true);
      });
    });

  }); // end configuration

});
