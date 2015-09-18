
 import { Bot } from './src/bot';
 import { HipChat } from './src/networks/hipchat/hipchat';
 import * as Hook from './src/utilities/hook';
 import { IRC } from './src/networks/irc/irc';
 import { Server } from './src/networks/irc/server'; // this shall not pass!!!
 import { Logger } from './src/utilities/logger';
 import { Network } from './src/networks/network';
 import { Slack } from './src/networks/slack/slack';
 import { Timer } from './src/utilities/timer';
 import { NetFactory } from './src/networks/netfactory';

 module.exports = {
   Bot,
   HipChat,
   Hook,
   IRC,
   Logger,
   NetFactory,
   Network,
   Server,
   Slack,
   Timer
 };
