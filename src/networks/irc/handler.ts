import { Message } from '../../messaging/message';
import * as _ from '../../utilities/lodash';
import { IRC } from '@status/codes';
import { Irc } from './irc';

export class Handler {
  constructor(public network: Irc) {
    _.each(_.compact(_.uniq(_.keys(IRC))), (name: IRC) => {
      const event = `${name}::${this.network.name}`;
      // we should never get a code 0, so this should be ok
      const listener: IRC = parseInt(name, 10) ? (IRC as any)[name] : name;

      try {
        this.network.bot.on(event, (this as any)[listener].bind(this));
      } catch (e) {
        this.network.bot.Logger.warn(`IRC Constant ${listener} defined with no handler`);

        this.network.bot.on(event, (message: any) => {
          this.network.bot.Logger.warn(`IRC Constant event ${message.command} occured with no handler`);
        });
      }
    });

    /**
     * If we receive unknown emits
     */
    this.network.bot.on(`UNKNOWN::${this.network.name}`, this.UNKNOWN.bind(this));
  }

  /**
   * Set the event to listen which signals IRCD registration is complete
   * @param <string> event: The event in which to listen
   * @return <void>
   */
  public setRegistrationListener(event?: string): void {
    const once = `${event || 'RPL_ENDOFMOTD'}::${this.network.name}`;

    this.network.bot.once(once, (message: any) => {
      this.network.bot.emit(
        `registered::${this.network.name}`,
        message.network,
        message.network.connection.server,
      );
    });
  }

  /**
   * Handle all unknown commands
   */
  public UNKNOWN(message: any): void {
    if (!message.command) return;

    this.network.bot.Logger.warn(`Unhandled command ${message.command}`, _.omit(message, ['network']));
  }

  public RPL_WELCOME(message: any): void {
    // assign actual nick in use to connection
    this.network.connection.nick = message.params[0];
  }

  public ERR_NOSUCHNICK(message: any): void {
    this.network.bot.Logger.warn(
      'IRC Constant ' + (IRC as any)[message.command] + ' handler defined with no implementation',
    );
  }
  public ERR_NOSUCHSERVER(message: any): void {
    this.network.bot.Logger.warn(
      'IRC Constant ' + (IRC as any)[message.command] + ' handler defined with no implementation',
    );
  }
  public ERR_NOSUCHCHANNEL(message: any): void {
    this.network.bot.Logger.warn(
      'IRC Constant ' + (IRC as any)[message.command] + ' handler defined with no implementation',
    );
  }
  public ERR_CANNOTSENDTOCHAN(message: any): void {
    this.network.bot.Logger.warn(
      'IRC Constant ' + (IRC as any)[message.command] + ' handler defined with no implementation',
    );
  }
  public ERR_TOOMANYCHANNELS(message: any): void {
    this.network.bot.Logger.warn(
      'IRC Constant ' + (IRC as any)[message.command] + ' handler defined with no implementation',
    );
  }
  public ERR_WASNOSUCHNICK(message: any): void {
    this.network.bot.Logger.warn(
      'IRC Constant ' + (IRC as any)[message.command] + ' handler defined with no implementation',
    );
  }
  public ERR_TOOMANYTARGETS(message: any): void {
    this.network.bot.Logger.warn(
      'IRC Constant ' + (IRC as any)[message.command] + ' handler defined with no implementation',
    );
  }
  public ERR_NOORIGIN(message: any): void {
    this.network.bot.Logger.warn(
      'IRC Constant ' + (IRC as any)[message.command] + ' handler defined with no implementation',
    );
  }
  public ERR_NORECIPIENT(message: any): void {
    this.network.bot.Logger.warn(
      'IRC Constant ' + (IRC as any)[message.command] + ' handler defined with no implementation',
    );
  }
  public ERR_NOTEXTTOSEND(message: any): void {
    this.network.bot.Logger.warn(
      'IRC Constant ' + (IRC as any)[message.command] + ' handler defined with no implementation',
    );
  }
  public ERR_NOTOPLEVEL(message: any): void {
    this.network.bot.Logger.warn(
      'IRC Constant ' + (IRC as any)[message.command] + ' handler defined with no implementation',
    );
  }
  public ERR_WILDTOPLEVEL(message: any): void {
    this.network.bot.Logger.warn(
      'IRC Constant ' + (IRC as any)[message.command] + ' handler defined with no implementation',
    );
  }
  public ERR_UNKNOWNCOMMAND(message: any): void {
    this.network.bot.Logger.warn(
      'IRC Constant ' + (IRC as any)[message.command] + ' handler defined with no implementation',
    );
  }

  public ERR_NOADMININFO(message: any): void {
    this.network.bot.Logger.warn(
      'IRC Constant ' + (IRC as any)[message.command] + ' handler defined with no implementation',
    );
  }
  public ERR_FILEERROR(message: any): void {
    this.network.bot.Logger.warn(
      'IRC Constant ' + (IRC as any)[message.command] + ' handler defined with no implementation',
    );
  }
  public ERR_NONICKNAMEGIVEN(message: any): void {
    this.network.bot.Logger.warn(
      'IRC Constant ' + (IRC as any)[message.command] + ' handler defined with no implementation',
    );
  }
  public ERR_ERRONEUSNICKNAME(message: any): void {
    this.network.bot.Logger.warn(
      'IRC Constant ' + (IRC as any)[message.command] + ' handler defined with no implementation',
    );
  }

  /**
   * This is only for during connection
   * otherwise listen for the emit
   * @param <any> message: the message emitted from connection
   * @return <void>
   */
  public ERR_NICKNAMEINUSE(message: any): void {
    if (this.network.connection.registered) {
      return;
    }

    const use_nick: string = this.determineNick();

    this.network.connection.nick = this.network.generateNick(use_nick);

    this.network.send(`NICK ${this.network.connection.nick}`);
  }

  private determineNick(): string {
    return this.network.nick === this.network.connection.nick
      ? this.network.alt_nick
      : this.network.nick;
  }

  public ERR_NICKCOLLISION(message: any): void {
    this.network.bot.Logger.warn(
      'IRC Constant ' + (IRC as any)[message.command] + ' handler defined with no implementation',
    );
  }
  public ERR_USERNOTINCHANNEL(message: any): void {
    this.network.bot.Logger.warn(
      'IRC Constant ' + (IRC as any)[message.command] + ' handler defined with no implementation',
    );
  }
  public ERR_NOTONCHANNEL(message: any): void {
    this.network.bot.Logger.warn(
      'IRC Constant ' + (IRC as any)[message.command] + ' handler defined with no implementation',
    );
  }
  public ERR_USERONCHANNEL(message: any): void {
    this.network.bot.Logger.warn(
      'IRC Constant ' + (IRC as any)[message.command] + ' handler defined with no implementation',
    );
  }
  public ERR_NOLOGIN(message: any): void {
    this.network.bot.Logger.warn(
      'IRC Constant ' + (IRC as any)[message.command] + ' handler defined with no implementation',
    );
  }
  public ERR_SUMMONDISABLED(message: any): void {
    this.network.bot.Logger.warn(
      'IRC Constant ' + (IRC as any)[message.command] + ' handler defined with no implementation',
    );
  }
  public ERR_USERSDISABLED(message: any): void {
    this.network.bot.Logger.warn(
      'IRC Constant ' + (IRC as any)[message.command] + ' handler defined with no implementation',
    );
  }
  public ERR_NOTREGISTERED(message: any): void {
    this.network.bot.Logger.warn(
      'IRC Constant ' + (IRC as any)[message.command] + ' handler defined with no implementation',
    );
  }
  public ERR_NEEDMOREPARAMS(message: any): void {
    this.network.bot.Logger.warn(
      'IRC Constant ' + (IRC as any)[message.command] + ' handler defined with no implementation',
    );
  }
  public ERR_ALREADYREGISTRED(message: any): void {
    this.network.bot.Logger.warn(
      'IRC Constant ' + (IRC as any)[message.command] + ' handler defined with no implementation',
    );
  }
  public ERR_NOPERMFORHOST(message: any): void {
    this.network.bot.Logger.warn(
      'IRC Constant ' + (IRC as any)[message.command] + ' handler defined with no implementation',
    );
  }
  public ERR_PASSWDMISMATCH(message: any): void {
    this.network.bot.Logger.warn(
      'IRC Constant ' + (IRC as any)[message.command] + ' handler defined with no implementation',
    );
  }
  public ERR_YOUREBANNEDCREEP(message: any): void {
    this.network.bot.Logger.warn(
      'IRC Constant ' + (IRC as any)[message.command] + ' handler defined with no implementation',
    );
  }
  public ERR_KEYSET(message: any): void {
    this.network.bot.Logger.warn(
      'IRC Constant ' + (IRC as any)[message.command] + ' handler defined with no implementation',
    );
  }
  public ERR_CHANNELISFULL(message: any): void {
    this.network.bot.Logger.warn(
      'IRC Constant ' + (IRC as any)[message.command] + ' handler defined with no implementation',
    );
  }
  public ERR_UNKNOWNMODE(message: any): void {
    this.network.bot.Logger.warn(
      'IRC Constant ' + (IRC as any)[message.command] + ' handler defined with no implementation',
    );
  }
  public ERR_INVITEONLYCHAN(message: any): void {
    this.network.bot.Logger.warn(
      'IRC Constant ' + (IRC as any)[message.command] + ' handler defined with no implementation',
    );
  }
  public ERR_BANNEDFROMCHAN(message: any): void {
    this.network.bot.Logger.warn(
      'IRC Constant ' + (IRC as any)[message.command] + ' handler defined with no implementation',
    );
  }
  public ERR_BADCHANNELKEY(message: any): void {
    this.network.bot.Logger.warn(
      'IRC Constant ' + (IRC as any)[message.command] + ' handler defined with no implementation',
    );
  }
  public ERR_NOPRIVILEGES(message: any): void {
    this.network.bot.Logger.warn(
      'IRC Constant ' + (IRC as any)[message.command] + ' handler defined with no implementation',
    );
  }
  public ERR_CHANOPRIVSNEEDED(message: any): void {
    this.network.bot.Logger.warn(
      'IRC Constant ' + (IRC as any)[message.command] + ' handler defined with no implementation',
    );
  }
  public ERR_CANTKILLSERVER(message: any): void {
    this.network.bot.Logger.warn(
      'IRC Constant ' + (IRC as any)[message.command] + ' handler defined with no implementation',
    );
  }
  public ERR_NOOPERHOST(message: any): void {
    this.network.bot.Logger.warn(
      'IRC Constant ' + (IRC as any)[message.command] + ' handler defined with no implementation',
    );
  }
  public ERR_UMODEUNKNOWNFLAG(message: any): void {
    this.network.bot.Logger.warn(
      'IRC Constant ' + (IRC as any)[message.command] + ' handler defined with no implementation',
    );
  }
  public ERR_USERSDONTMATCH(message: any): void {
    this.network.bot.Logger.warn(
      'IRC Constant ' + (IRC as any)[message.command] + ' handler defined with no implementation',
    );
  }
  public RPL_NONE(message: any): void {
    this.network.bot.Logger.warn(
      'IRC Constant ' + (IRC as any)[message.command] + ' handler defined with no implementation',
    );
  }
  public RPL_USERHOST(message: any): void {
    this.network.bot.Logger.warn(
      'IRC Constant ' + (IRC as any)[message.command] + ' handler defined with no implementation',
    );
  }
  public RPL_ISON(message: any): void {
    this.network.bot.Logger.warn(
      'IRC Constant ' + (IRC as any)[message.command] + ' handler defined with no implementation',
    );
  }
  public RPL_AWAY(message: any): void {
    this.network.bot.Logger.warn(
      'IRC Constant ' + (IRC as any)[message.command] + ' handler defined with no implementation',
    );
  }
  public RPL_UNAWAY(message: any): void {
    this.network.bot.Logger.warn(
      'IRC Constant ' + (IRC as any)[message.command] + ' handler defined with no implementation',
    );
  }
  public RPL_NOWAWAY(message: any): void {
    this.network.bot.Logger.warn(
      'IRC Constant ' + (IRC as any)[message.command] + ' handler defined with no implementation',
    );
  }
  public RPL_WHOISUSER(message: any): void {
    this.network.bot.Logger.warn(
      'IRC Constant ' + (IRC as any)[message.command] + ' handler defined with no implementation',
    );
  }
  public RPL_WHOISSERVER(message: any): void {
    this.network.bot.Logger.warn(
      'IRC Constant ' + (IRC as any)[message.command] + ' handler defined with no implementation',
    );
  }
  public RPL_WHOISOPERATOR(message: any): void {
    this.network.bot.Logger.warn(
      'IRC Constant ' + (IRC as any)[message.command] + ' handler defined with no implementation',
    );
  }
  public RPL_WHOISIDLE(message: any): void {
    this.network.bot.Logger.warn(
      'IRC Constant ' + (IRC as any)[message.command] + ' handler defined with no implementation',
    );
  }
  public RPL_ENDOFWHOIS(message: any): void {
    this.network.bot.Logger.warn(
      'IRC Constant ' + (IRC as any)[message.command] + ' handler defined with no implementation',
    );
  }
  public RPL_WHOISCHANNELS(message: any): void {
    this.network.bot.Logger.warn(
      'IRC Constant ' + (IRC as any)[message.command] + ' handler defined with no implementation',
    );
  }
  public RPL_WHOWASUSER(message: any): void {
    this.network.bot.Logger.warn(
      'IRC Constant ' + (IRC as any)[message.command] + ' handler defined with no implementation',
    );
  }
  public RPL_ENDOFWHOWAS(message: any): void {
    this.network.bot.Logger.warn(
      'IRC Constant ' + (IRC as any)[message.command] + ' handler defined with no implementation',
    );
  }
  public RPL_LISTSTART(message: any): void {
    this.network.bot.Logger.warn(
      'IRC Constant ' + (IRC as any)[message.command] + ' handler defined with no implementation',
    );
  }
  public RPL_LIST(message: any): void {
    this.network.bot.Logger.warn(
      'IRC Constant ' + (IRC as any)[message.command] + ' handler defined with no implementation',
    );
  }
  public RPL_LISTEND(message: any): void {
    this.network.bot.Logger.warn(
      'IRC Constant ' + (IRC as any)[message.command] + ' handler defined with no implementation',
    );
  }
  public RPL_CHANNELMODEIS(message: any): void {
    this.network.bot.Logger.warn(
      'IRC Constant ' + (IRC as any)[message.command] + ' handler defined with no implementation',
    );
  }
  public RPL_NOTOPIC(message: any): void {
    this.network.bot.Logger.warn(
      'IRC Constant ' + (IRC as any)[message.command] + ' handler defined with no implementation',
    );
  }

  public RPL_TOPIC(message: any): void {
    this.network.bot.Logger.warn(
      'IRC Constant ' + (IRC as any)[message.command] + ' handler defined with no implementation',
    );
  }

  public RPL_INVITING(message: any): void {
    this.network.bot.Logger.warn(
      'IRC Constant ' + (IRC as any)[message.command] + ' handler defined with no implementation',
    );
  }

  public RPL_SUMMONING(message: any): void {
    this.network.bot.Logger.warn(
      'IRC Constant ' + (IRC as any)[message.command] + ' handler defined with no implementation',
    );
  }

  public RPL_VERSION(message: any): void {
    this.network.bot.Logger.warn(
      'IRC Constant ' + (IRC as any)[message.command] + ' handler defined with no implementation',
    );
  }

  public RPL_WHOREPLY(message: any): void {
    this.network.bot.Logger.warn(
      'IRC Constant ' + (IRC as any)[message.command] + ' handler defined with no implementation',
    );
  }

  public RPL_ENDOFWHO(message: any): void {
    this.network.bot.Logger.warn(
      'IRC Constant ' + (IRC as any)[message.command] + ' handler defined with no implementation',
    );
  }

  public RPL_NAMREPLY(message: any): void {
    this.RPL_NAMEREPLY(message);
  }

  public RPL_NAMEREPLY(message: any): void {
    const channel = this.network.channel[message.params[2]];
    const names = message.params[message.params.length - 1].split(' ');

    names.forEach((name: string) => {
      channel.addUser({ name: name });
    });
  }

  public RPL_WHOSPCRPL(message: any): void {
    this.network.bot.Logger.warn(
      'IRC Constant ' + (IRC as any)[message.command] + ' handler defined with no implementation',
    );
  }

  public RPL_ENDOFNAMES(message: any): void {
    // do we really need to do anything??
  }
  public RPL_LINKS(message: any): void {
    this.network.bot.Logger.warn(
      'IRC Constant ' + (IRC as any)[message.command] + ' handler defined with no implementation',
    );
  }
  public RPL_ENDOFLINKS(message: any): void {
    this.network.bot.Logger.warn(
      'IRC Constant ' + (IRC as any)[message.command] + ' handler defined with no implementation',
    );
  }
  public RPL_BANLIST(message: any): void {
    this.network.bot.Logger.warn(
      'IRC Constant ' + (IRC as any)[message.command] + ' handler defined with no implementation',
    );
  }
  public RPL_ENDOFBANLIST(message: any): void {
    this.network.bot.Logger.warn(
      'IRC Constant ' + (IRC as any)[message.command] + ' handler defined with no implementation',
    );
  }
  public RPL_INFO(message: any): void {
    this.network.bot.Logger.warn(
      'IRC Constant ' + (IRC as any)[message.command] + ' handler defined with no implementation',
    );
  }
  public RPL_ENDOFINFO(message: any): void {
    this.network.bot.Logger.warn(
      'IRC Constant ' + (IRC as any)[message.command] + ' handler defined with no implementation',
    );
  }

  /**
   * Message of the day handlers
   */
  public ERR_NOMOTD(message: any): void {
    this.RPL_MOTDSTART();

    // because it's the default registration listener
    this.network.bot.emit(`RPL_ENDOFMOTD::${this.network.name}`, message);
  }
  public RPL_MOTDSTART(message?: any): void {
    this.network.ircd.motd = [];
  }
  public RPL_MOTD(message: any): void {
    this.network.ircd.motd.push(message.params[1]);
  }
  public RPL_ENDOFMOTD(message: any): void {
    Object.freeze(this.network.ircd.motd);

    this.network.bot.emit(`MOTD::${this.network.name}`, this.network, this.network.ircd.motd);
  }

  public RPL_YOUREOPER(message: any): void {
    this.network.bot.Logger.warn(
      'IRC Constant ' + (IRC as any)[message.command] + ' handler defined with no implementation',
    );
  }
  public RPL_REHASHING(message: any): void {
    this.network.bot.Logger.warn(
      'IRC Constant ' + (IRC as any)[message.command] + ' handler defined with no implementation',
    );
  }
  public RPL_QLIST(message: any): void {
    this.network.bot.Logger.warn(
      'IRC Constant ' + (IRC as any)[message.command] + ' handler defined with no implementation',
    );
  }
  public RPL_ENDOFQLIST(message: any): void {
    this.network.bot.Logger.warn(
      'IRC Constant ' + (IRC as any)[message.command] + ' handler defined with no implementation',
    );
  }
  public RPL_TIME(message: any): void {
    this.network.bot.Logger.warn(
      'IRC Constant ' + (IRC as any)[message.command] + ' handler defined with no implementation',
    );
  }
  public RPL_USERSSTART(message: any): void {
    this.network.bot.Logger.warn(
      'IRC Constant ' + (IRC as any)[message.command] + ' handler defined with no implementation',
    );
  }
  public RPL_USERS(message: any): void {
    this.network.bot.Logger.warn(
      'IRC Constant ' + (IRC as any)[message.command] + ' handler defined with no implementation',
    );
  }
  public RPL_ENDOFUSERS(message: any): void {
    this.network.bot.Logger.warn(
      'IRC Constant ' + (IRC as any)[message.command] + ' handler defined with no implementation',
    );
  }
  public RPL_NOUSERS(message: any): void {
    this.network.bot.Logger.warn(
      'IRC Constant ' + (IRC as any)[message.command] + ' handler defined with no implementation',
    );
  }
  public RPL_TRACELINK(message: any): void {
    this.network.bot.Logger.warn(
      'IRC Constant ' + (IRC as any)[message.command] + ' handler defined with no implementation',
    );
  }
  public RPL_TRACECONNECTING(message: any): void {
    this.network.bot.Logger.warn(
      'IRC Constant ' + (IRC as any)[message.command] + ' handler defined with no implementation',
    );
  }
  public RPL_TRACEHANDSHAKE(message: any): void {
    this.network.bot.Logger.warn(
      'IRC Constant ' + (IRC as any)[message.command] + ' handler defined with no implementation',
    );
  }
  public RPL_TRACEUNKNOWN(message: any): void {
    this.network.bot.Logger.warn(
      'IRC Constant ' + (IRC as any)[message.command] + ' handler defined with no implementation',
    );
  }
  public RPL_TRACEOPERATOR(message: any): void {
    this.network.bot.Logger.warn(
      'IRC Constant ' + (IRC as any)[message.command] + ' handler defined with no implementation',
    );
  }
  public RPL_TRACEUSER(message: any): void {
    this.network.bot.Logger.warn(
      'IRC Constant ' + (IRC as any)[message.command] + ' handler defined with no implementation',
    );
  }
  public RPL_TRACESERVER(message: any): void {
    this.network.bot.Logger.warn(
      'IRC Constant ' + (IRC as any)[message.command] + ' handler defined with no implementation',
    );
  }
  public RPL_TRACENEWTYPE(message: any): void {
    this.network.bot.Logger.warn(
      'IRC Constant ' + (IRC as any)[message.command] + ' handler defined with no implementation',
    );
  }
  public RPL_TRACELOG(message: any): void {
    this.network.bot.Logger.warn(
      'IRC Constant ' + (IRC as any)[message.command] + ' handler defined with no implementation',
    );
  }
  public RPL_STATSLINKINFO(message: any): void {
    this.network.bot.Logger.warn(
      'IRC Constant ' + (IRC as any)[message.command] + ' handler defined with no implementation',
    );
  }
  public RPL_STATSCOMMANDS(message: any): void {
    this.network.bot.Logger.warn(
      'IRC Constant ' + (IRC as any)[message.command] + ' handler defined with no implementation',
    );
  }
  public RPL_STATSCLINE(message: any): void {
    this.network.bot.Logger.warn(
      'IRC Constant ' + (IRC as any)[message.command] + ' handler defined with no implementation',
    );
  }
  public RPL_STATSNLINE(message: any): void {
    this.network.bot.Logger.warn(
      'IRC Constant ' + (IRC as any)[message.command] + ' handler defined with no implementation',
    );
  }
  public RPL_STATSILINE(message: any): void {
    this.network.bot.Logger.warn(
      'IRC Constant ' + (IRC as any)[message.command] + ' handler defined with no implementation',
    );
  }
  public RPL_STATSKLINE(message: any): void {
    this.network.bot.Logger.warn(
      'IRC Constant ' + (IRC as any)[message.command] + ' handler defined with no implementation',
    );
  }
  public RPL_STATSYLINE(message: any): void {
    this.network.bot.Logger.warn(
      'IRC Constant ' + (IRC as any)[message.command] + ' handler defined with no implementation',
    );
  }
  public RPL_ENDOFSTATS(message: any): void {
    this.network.bot.Logger.warn(
      'IRC Constant ' + (IRC as any)[message.command] + ' handler defined with no implementation',
    );
  }
  public RPL_STATSLLINE(message: any): void {
    this.network.bot.Logger.warn(
      'IRC Constant ' + (IRC as any)[message.command] + ' handler defined with no implementation',
    );
  }
  public RPL_STATSUPTIME(message: any): void {
    this.network.bot.Logger.warn(
      'IRC Constant ' + (IRC as any)[message.command] + ' handler defined with no implementation',
    );
  }
  public RPL_STATSOLINE(message: any): void {
    this.network.bot.Logger.warn(
      'IRC Constant ' + (IRC as any)[message.command] + ' handler defined with no implementation',
    );
  }
  public RPL_STATSHLINE(message: any): void {
    this.network.bot.Logger.warn(
      'IRC Constant ' + (IRC as any)[message.command] + ' handler defined with no implementation',
    );
  }
  public RPL_UMODEIS(message: any): void {
    this.network.bot.Logger.warn(
      'IRC Constant ' + (IRC as any)[message.command] + ' handler defined with no implementation',
    );
  }
  public RPL_LUSERCLIENT(message: any): void {
    this.network.bot.Logger.warn(
      'IRC Constant ' + (IRC as any)[message.command] + ' handler defined with no implementation',
    );
  }
  public RPL_LUSEROP(message: any): void {
    this.network.bot.Logger.warn(
      'IRC Constant ' + (IRC as any)[message.command] + ' handler defined with no implementation',
    );
  }
  public RPL_LUSERUNKNOWN(message: any): void {
    this.network.bot.Logger.warn(
      'IRC Constant ' + (IRC as any)[message.command] + ' handler defined with no implementation',
    );
  }
  public RPL_LUSERCHANNELS(message: any): void {
    this.network.bot.Logger.warn(
      'IRC Constant ' + (IRC as any)[message.command] + ' handler defined with no implementation',
    );
  }
  public RPL_LUSERME(message: any): void {
    this.network.bot.Logger.warn(
      'IRC Constant ' + (IRC as any)[message.command] + ' handler defined with no implementation',
    );
  }
  public RPL_ADMINME(message: any): void {
    this.network.bot.Logger.warn(
      'IRC Constant ' + (IRC as any)[message.command] + ' handler defined with no implementation',
    );
  }
  public RPL_ADMINLOC1(message: any): void {
    this.network.bot.Logger.warn(
      'IRC Constant ' + (IRC as any)[message.command] + ' handler defined with no implementation',
    );
  }
  public RPL_ADMINLOC2(message: any): void {
    this.network.bot.Logger.warn(
      'IRC Constant ' + (IRC as any)[message.command] + ' handler defined with no implementation',
    );
  }
  public RPL_ADMINEMAIL(message: any): void {
    this.network.bot.Logger.warn(
      'IRC Constant ' + (IRC as any)[message.command] + ' handler defined with no implementation',
    );
  }
  public RPL_MONONLINE(message: any): void {
    this.network.bot.Logger.warn(
      'IRC Constant ' + (IRC as any)[message.command] + ' handler defined with no implementation',
    );
  }
  public RPL_MONOFFLINE(message: any): void {
    this.network.bot.Logger.warn(
      'IRC Constant ' + (IRC as any)[message.command] + ' handler defined with no implementation',
    );
  }
  public RPL_MONLIST(message: any): void {
    this.network.bot.Logger.warn(
      'IRC Constant ' + (IRC as any)[message.command] + ' handler defined with no implementation',
    );
  }
  public RPL_ENDOFMONLIST(message: any): void {
    this.network.bot.Logger.warn(
      'IRC Constant ' + (IRC as any)[message.command] + ' handler defined with no implementation',
    );
  }
  public ERR_MONLISTFULL(message: any): void {
    this.network.bot.Logger.warn(
      'IRC Constant ' + (IRC as any)[message.command] + ' handler defined with no implementation',
    );
  }
  public RPL_SASLLOGIN(message: any): void {
    this.network.bot.Logger.warn(
      'IRC Constant ' + (IRC as any)[message.command] + ' handler defined with no implementation',
    );
  }
  public RPL_SASLSUCCESS(message: any): void {
    this.network.bot.Logger.warn(
      'IRC Constant ' + (IRC as any)[message.command] + ' handler defined with no implementation',
    );
  }
  public RPL_SASLFAILED(message: any): void {
    this.network.bot.Logger.warn(
      'IRC Constant ' + (IRC as any)[message.command] + ' handler defined with no implementation',
    );
  }
  public RPL_SASLERROR(message: any): void {
    this.network.bot.Logger.warn(
      'IRC Constant ' + (IRC as any)[message.command] + ' handler defined with no implementation',
    );
  }
  public RPL_SASLABORT(message: any): void {
    this.network.bot.Logger.warn(
      'IRC Constant ' + (IRC as any)[message.command] + ' handler defined with no implementation',
    );
  }
  public RPL_SASLALREADYAUTH(message: any): void {
    this.network.bot.Logger.warn(
      'IRC Constant ' + (IRC as any)[message.command] + ' handler defined with no implementation',
    );
  }

  PING(message: any): void {
    this.network.connection.pong(message.params[0]);
  }

  /**
   * Some networks issue a challenge during connection in an attempt to
   * keep bots away, (looking at you Undernet)
   */
  QUOTE_PONG(message: any): void {
    this.network.send(
      message.params
        .pop()
        .match(/\/(.*)/)
        .pop(),
    );
  }

  CAP(message: any): void {
    let capabilities = message.params[message.params.length - 1].replace(/(?:^| )[\-~=]/, '').split(' ');

    if (!this.network.sasl) {
      _.remove(capabilities, (cap) => cap === 'sasl');
    }

    switch (message.params[1]) {
      case 'LS':
        capabilities = []; // temporary, will deal with this soon
        if (capabilities.length) {
          this.network.connection.capabilities.requested = capabilities;
          this.network.connection.sendCapReq(capabilities.join(' '));
        } else {
          this.network.connection.sendCapEnd();
        }
        break;
      case 'ACK':
        if (capabilities.length) {
          // Update list of enabled capabilities
          this.network.connection.capabilities.enabled = capabilities;
          // Update list of capabilities we would like to have but that aren't enabled
          this.network.connection.capabilities.requested = _.difference(
            this.network.connection.capabilities.requested,
            capabilities,
          );
        }
        if (this.network.connection.capabilities.enabled.length) {
          if (_.includes(this.network.connection.capabilities.enabled, 'sasl')) {
            this.network.send('AUTHENTICATE PLAIN');
          } else {
            this.network.connection.sendCapEnd();
          }
        }
        break;
      case 'NAK':
        if (capabilities.length) {
          this.network.connection.capabilities.requested = _.difference(
            this.network.connection.capabilities.requested,
            capabilities,
          );
        }
        if (this.network.connection.capabilities.requested.length) {
          this.network.connection.sendCapEnd();
        }
        break;
      case 'LIST':
        // should we do anything here?
        break;
    }
  }

  /**
   * Called when a user parts the channel
   * @param <any> message: The parted user details
   * @return <void>
   * @todo change this to not use Message, its an event...
   */
  PART(message: any): void {
    let msg: Message<Irc>, nick: string;

    message.channel = this.network.addChannel({ name: message.params[0] });
    message.target = message.channel;

    nick = message.nick;

    // the bot parted the channel
    if (nick === this.network.connection.nick) {
      message.channel.inChannel = false;
    } else {
      message.user = this.network.findUser(nick);
      message.channel.removeUser(message.user);
    }

    msg = new Message<Irc>(message);

    msg.events.push('part');
    msg.events.push('public');

    this.route(msg);
  }

  /**
   * Called when a user joins a channel
   * @param <any> message: The joined user details
   * @return <void>
   * @todo change this to not use Message, its an event...
   */
  protected JOIN(message: any): void {
    let msg: Message<Irc>, nick: string, ident: string, hostname: string;

    message.channel = this.network.addChannel({ name: message.params[0] });

    nick = message.nick;
    ident = message.ident;
    hostname = message.hostname;

    // the bot joined the channel
    if (nick === this.network.connection.nick) {
      message.channel.inChannel = true;

      this.network.ident = ident;
      this.network.hostname = hostname;
    }
    // someone else joined the channel
    else {
      message.user = message.channel.addUser({
        name: nick,
        ident,
        hostname,
      });
    }
  }

  /**
   * Send a message to the router
   * @param <any> message: The message object literal to send
   * @return <void>
   */
  private route(message: Message<Irc>): void;
  private route(message: any): void {
    if (!(message instanceof Message)) message = new Message(message);

    this.network.bot.router.route(message);
  }

  /**
   * This can be a private message, channel message or action
   * @param <any> message: The message details
   * @return <void>
   */
  private PRIVMSG(message: any): void {
    console.log(message instanceof Message);
    console.log(message.content);
    console.log(_.omit(message, ['network']));
    this.route(message);
  }

  /**
   * Receive a notice from the IRC Server
   * @param <any> message: The message that is received
   * @return <void>
   */
  NOTICE(message: any): void {
    this.defineMessage(message);
  }

  /**
   * Construct a message to send to the message router
   * @param <any> message: The message starting point
   * @return <void>
   */
  private defineMessage(message: any): void {
    let msg: Message<Irc>, match: RegExpExecArray;

    message.channel = this.network.channel[message.params[0].toLowerCase()];
    message.user = this.network.findUser(message.nick);
    message.target = message.channel || message.user;

    if (!message.target) return;

    message.message = message.params[1];

    // match ctcp
    match = /^(\u0001)(.*)(\u0001)$/.exec(message.params[1]);

    if (match && message.target === message.user) {
      // we don't want it to match action
      if (!message.message.substr(1, 6).match(/^ACTION$/)) {
        return this.handleCTCP(message, match);
      }
    }

    msg = new Message<Irc>(message);

    /**
     * Did this event happen in a channel or as a private message?
     */
    msg.events.push(msg.target === msg.channel ? 'public' : 'private');

    if (msg.command.match(/^NOTICE/i)) msg.events.push('notice');
    else if (msg.content.substr(1, 6).match(/^ACTION$/)) {
      msg.events.push('action');
      msg.content = msg.content.slice(7).trim();
    } else if (msg.command.match(/^PRIVMSG/i)) msg.events.push('message');
    // this shouldn't happen, but...
    else {
      msg.events.push('unknown');

      this.network.bot.Logger.warn(
        `Unknown IRC event with command ${msg.command} and message ${msg.content}`,
      );
    }

    this.route(msg);
  }

  /**
   * @todo handle VERSION , SOURCE and other CTCP queries
   */
  private handleCTCP(message: Message<Irc>, match: RegExpExecArray): void {
    console.log('ctcp', match);
  }

  protected MODE(message: Message<Irc>): void {
    this.network.bot.Logger.warn(
      `IRC Constant ${(IRC as any)[message.command]} handler defined with no implementation`,
    );
  }
}
