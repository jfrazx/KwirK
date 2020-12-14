
const Kwirk = require('../../../index');
const Bot = Kwirk.Bot;
const Connection = Kwirk.IrcConnection;
const assert = require('assert');

describe('IRC Connection', () => {
  const bot = new Bot();
  bot.addNetwork({
    name: 'freenode',
    type: 'irc',
    servers: [
      {
        host: 'adams.freenode.net',
        port: 7000,
        ssl: true
      }
    ]
  });

  const connection = new Connection(bot.network.freenode, bot.network.freenode.servers[0]);
  const lines = [
    ':dk.mythnet.org 001 kwirk :Welcome to the Mythnet Internet Relay Chat Network kwirk',
    ':dk.mythnet.org 002 kwirk :Your host is dk.mythnet.org[5.56.159.140/7000], running version charybdis-3.3',
    ':dk.mythnet.org 254 kwirk 89 :channels formed',
    'asimov.freenode.net NOTICE * :*** Checking Ident',
    ':asimov.freenode.net CAP * LS :account-notify extended-join identify-msg multi-prefix sasl',
    ':asimov.freenode.net 005 kwirk CHANTYPES=# EXCEPTS INVEX CHANMODES=eIbq,k,flj,CFLMPQScgimnprstz CHANLIMIT=#:120 PREFIX=(ov)@+ MAXLIST=bqeI:100 MODES=4 NETWORK=freenode KNOCK STATUSMSG=@+ CALLERID=g :are supported by this server',
    ':asimov.freenode.net 005 kwirk CASEMAPPING=rfc1459 CHARSET=ascii NICKLEN=16 CHANNELLEN=50 TOPICLEN=390 ETRACE CPRIVMSG CNOTICE DEAF=D MONITOR=100 FNC TARGMAX=NAMES:1,LIST:1,KICK:1,WHOIS:1,PRIVMSG:4,NOTICE:4,ACCEPT:,MONITOR: :are supported by this server'
  ];

  it('should parse messages', () => {
    lines.forEach((line) => {
      connection.onData(line);
    });
  });
});
