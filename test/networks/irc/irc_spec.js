
const Kwirk  = require( '../../../index' );
const Bot    = Kwirk.Bot;
const Server = Kwirk.Server;
const IRC    = Kwirk.IRC;
const assert = require( 'assert' );

describe( "IRC", function(){
  const bot = new Bot();

  describe( 'configuration', function(){
    it( 'should have default values applied', function(){
      const network = new IRC( bot,
        {
          type: 'irc',
          name: 'freenode',
          enable: false,
          servers: [
            {
              host: 'bradbury.freenode.net',
              port: 7000,
              ssl: true
            }
          ],
          channels: [
            {
              name: '#kwirk',
              modes: [ 'n', 't', 's', 'p' ],
              password: 'channelkey',
              key: 'channelfishkey'
            }
          ]
        }
      );

      assert.equal(network.encoding, 'utf8');
      assert.equal(network.nick, 'kwirk');
      assert.equal(network.altnick, 'kw?rk');
      assert.equal(network.realname, 'KwirK IRC Bot');
      assert.equal(network.user, 'KwirK');
      assert.equal(network.modes.length, 1);
      assert.deepEqual(network.modes, [ 'i' ]);
      assert.equal(network.owner, '');
      assert.equal(network.trigger, '!');
      assert.equal( network.quit_message, 'KwirK, a sophisticated multi-network, multi-protocol bot' );
    });

    it( 'should accept assigned default values', function(){
      const network = new IRC( bot,
        {
          name: 'freenode',
          type: 'irc',
          enable: false,
          servers: [{
            host: 'bradbury.freenode.net',
            port: 7000,
            ssl: true
          }],
          encoding: 'ascii',
          nick: 'KWIRK',
          realname: 'KWIRK IRC BOT',
          user: 'KWIRK',
          modes: ['n', 't'],
          owner: 'KWIRK',
          trigger: '.',
          quit_message: 'KWIRK, A FANCY IRC BOT'
        }
      );

      assert.equal(network.encoding, 'ascii');
      assert.equal(network.nick, 'KWIRK');
      assert.equal(network.realname, 'KWIRK IRC BOT');
      assert.equal(network.user, 'KWIRK');
      assert.equal(network.modes.length, 2);
      assert.deepEqual(network.modes, ['n', 't']);
      assert.equal(network.owner, 'KWIRK');
      assert.equal(network.trigger, '.');
      assert.equal(network.quit_message, 'KWIRK, A FANCY IRC BOT');

    });

    it('should accept values and assign defaults', function(){
      const network = new IRC( bot,
        {
          type: 'irc',
          name: 'freenode',
          enable: false,
          servers: [{
            host: 'bradbury.freenode.net',
            port: 7000,
            ssl: true
          }],
          realname: 'KWIRK IRC BOT',
          user: 'KWIRK',
          owner: 'KWIRK',
          trigger: '.'
        }
      );

      assert.equal(network.encoding, 'utf8');
      assert.equal(network.nick, 'kwirk');
      assert.equal(network.realname, 'KWIRK IRC BOT');
      assert.equal(network.user, 'KWIRK');
      assert.equal(network.modes.length, 1);
      assert.deepEqual(network.modes, ['i']);
      assert.equal(network.owner, 'KWIRK');
      assert.equal(network.trigger, '.');
      assert.equal(network.quit_message, 'KwirK, a sophisticated multi-network, multi-protocol bot');
    });

    it.skip('should accept values and assign defaults from bot initialization', function(){
      const bot = new Bot(
        {
          networks: [{
            name: 'freenode',
            enable: false,
            type: 'irc',
            servers: [{
              host: 'bradbury.freenode.net',
              port: 7000,
              ssl: true
            }],
            realname: 'KWIRK IRC BOT',
            user: 'KWIRK',
            owner: 'KWIRK',
            trigger: '.'
          }],
        }
      );

      const network = bot.networks[0];

      assert.equal(network.encoding, 'utf8');
      assert.equal(network.nick, 'kwirk');
      assert.equal(network.realname, 'KWIRK IRC BOT');
      assert.equal(network.user, 'KWIRK');
      assert.equal(network.modes.length, 4);
      assert.deepEqual(network.modes, ['n', 't', 's', 'p']);
      assert.equal(network.owner, 'KWIRK');
      assert.equal(network.trigger, '.');
      assert.equal(network.quit_message, 'KwirK, a fancy IRC bot');
    });

    it('should have an array of Servers', function(){
      const network = new IRC( bot,
        {
          name: 'freenode',
          enable: false,
          type: 'irc',
          servers: [
            {
              host: 'bradbury.freenode.net',
              port: 7000,
              ssl: true
            },
            {
              host: 'asimov.freenode.net',
              port: 7000,
              ssl: true
            }
          ]
        }
      );

      assert.equal(network.servers.length, 2);

      network.servers.forEach(function(server){
        assert.equal(server instanceof Server, true);
      });

    });

    it('should have a network name', function(){
      const network = new IRC( bot,
        {
          name: 'freenode',
          enable: false,
          servers: [{
            host: 'bradbury.freenode.net',
            port: 7000,
            ssl: true
          }]
        }
      );

      assert.equal(network.name, 'freenode');
    });

    it('should be disabled', function(){
      const network = new IRC( bot,
        {
          name: 'freenode',
          type: 'irc',
          enable: false,
          servers: [{
            host: 'bradbury.freenode.net',
            port: 7000,
            ssl: true
          }]
        }
      );

      assert.equal(network.enabled(), false);
    });

    it('should be enabled', function(){
      const network = new IRC( bot,
        {
          name: 'freenode',
          enable: true,
          type: 'irc',
          servers: [{
            host: 'bradbury.freenode.net',
            port: 7000,
            ssl: true
          }]
        }
      );

      assert.equal(network.enabled(), true);
    });

  }); //end configuration
});
