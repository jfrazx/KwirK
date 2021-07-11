import { IIRC, IRCOptions, Irc } from '@kwirk/networks';
import { NetworkHandlerRule } from '../base';

export class IrcRule extends NetworkHandlerRule<IIRC, IRCOptions> {
  static type = 'irc';

  protected defaultOptions: IRCOptions = {
    connectionAttempts: 10,
    encoding: 'utf8',
    enable: true,
    nick: 'kwirk',
    alt_nick: 'kw?rk',
    real_name: 'KwirK IRC Bot',
    user_name: 'KwirK',
    password: null,
    modes: ['i'], // user modes, not channel modes
    owner: '',
    trigger: '!',
    quit_message: 'KwirK, a sophisticated utility bot',
    reject_invalid_certs: false,
    sasl: null,
    servers: [],
    channels: [],
    name: null,
    use_ping_timer: false,
    ping_delay: 120000,
    reg_listen: null,
  };

  shouldHandle(): boolean {
    return this.options.type === IrcRule.type;
  }

  handle(): IIRC {
    return new Irc(this.bot, this.options);
  }
}
