
import { IRC } from './irc'
import { Constants } from '../../constants';
import * as _ from 'lodash';

export class Handler {

    constructor( public network: IRC ) {

      _.each ( _.compact( _.unique( _.keys( Constants.IRC ) ) ), ( name ) => {
        let event = name + '::' + this.network.name;
        let listener = name;
        if ( !!parseInt( name ) ) { // we should never get a code 0, so this should be ok
          listener = Constants.IRC[ name ];
        }

        try {
          this.network.bot.on( event, this[ listener ].bind( this ) );
        }
        catch ( e ) {
          this.network.bot.Logger.warn( 'IRC Constant ' + listener + ' defined with no handler' );

          this.network.bot.on( event, ( message: any ) => {
            this.network.bot.Logger.warn( 'IRC Constant event ' + message.command + ' occured with no handler' );
          });
        }
      });

      this.network.bot.on( 'UNKNOWN::'+ this.network.name, this.UNKNOWN.bind( this ) );
      this.network.bot.once( 'MODE::'+ this.network.name, ( message: any ) => {
        this.network.bot.emit( 'registered::'+ this.network.name, message.network, message.network.active_server );
      } );
    }

    /**
    * Handle all unknown commands
    */
    public UNKNOWN( message: any ): void {
      if ( !message.command ) return;

      this.network.bot.Logger.warn( 'Unhandled command ' + message.command, _.omit( message, ['network'] ));
    }

    public ERR_NOSUCHNICK( message: any ): void {
      this.network.bot.Logger.warn( 'IRC Constant ' + Constants.IRC[ message.command ] + ' handler defined with no associated actions' );
    }
    public ERR_NOSUCHSERVER( message: any ): void {
      this.network.bot.Logger.warn( 'IRC Constant ' + Constants.IRC[ message.command ] + ' handler defined with no associated actions' );
    }
    public ERR_NOSUCHCHANNEL( message: any ): void {
      this.network.bot.Logger.warn( 'IRC Constant ' + Constants.IRC[ message.command ] + ' handler defined with no associated actions' );
    }
    public ERR_CANNOTSENDTOCHAN( message: any ): void {
      this.network.bot.Logger.warn( 'IRC Constant ' + Constants.IRC[ message.command ] + ' handler defined with no associated actions' );
    }
    public ERR_TOOMANYCHANNELS( message: any ): void {
      this.network.bot.Logger.warn( 'IRC Constant ' + Constants.IRC[ message.command ] + ' handler defined with no associated actions' );
    }
    public ERR_WASNOSUCHNICK( message: any ): void {
      this.network.bot.Logger.warn( 'IRC Constant ' + Constants.IRC[ message.command ] + ' handler defined with no associated actions' );
    }
    public ERR_TOOMANYTARGETS( message: any ): void {
      this.network.bot.Logger.warn( 'IRC Constant ' + Constants.IRC[ message.command ] + ' handler defined with no associated actions' );
    }
    public ERR_NOORIGIN( message: any ): void {
      this.network.bot.Logger.warn( 'IRC Constant ' + Constants.IRC[ message.command ] + ' handler defined with no associated actions' );
    }
    public ERR_NORECIPIENT( message: any ): void {
      this.network.bot.Logger.warn( 'IRC Constant ' + Constants.IRC[ message.command ] + ' handler defined with no associated actions' );
    }
    public ERR_NOTEXTTOSEND( message: any ): void {
      this.network.bot.Logger.warn( 'IRC Constant ' + Constants.IRC[ message.command ] + ' handler defined with no associated actions' );
    }
    public ERR_NOTOPLEVEL( message: any ): void {
      this.network.bot.Logger.warn( 'IRC Constant ' + Constants.IRC[ message.command ] + ' handler defined with no associated actions' );
    }
    public ERR_WILDTOPLEVEL( message: any ): void {
      this.network.bot.Logger.warn( 'IRC Constant ' + Constants.IRC[ message.command ] + ' handler defined with no associated actions' );
    }
    public ERR_UNKNOWNCOMMAND( message: any ): void {
      this.network.bot.Logger.warn( 'IRC Constant ' + Constants.IRC[ message.command ] + ' handler defined with no associated actions' );
    }

    public ERR_NOADMININFO( message: any ): void {
      this.network.bot.Logger.warn( 'IRC Constant ' + Constants.IRC[ message.command ] + ' handler defined with no associated actions' );
    }
    public ERR_FILEERROR( message: any ): void {
      this.network.bot.Logger.warn( 'IRC Constant ' + Constants.IRC[ message.command ] + ' handler defined with no associated actions' );
    }
    public ERR_NONICKNAMEGIVEN( message: any ): void {
      this.network.bot.Logger.warn( 'IRC Constant ' + Constants.IRC[ message.command ] + ' handler defined with no associated actions' );
    }
    public ERR_ERRONEUSNICKNAME( message: any ): void {
      this.network.bot.Logger.warn( 'IRC Constant ' + Constants.IRC[ message.command ] + ' handler defined with no associated actions' );
    }
    public ERR_NICKNAMEINUSE( message: any ): void {
      this.network.bot.Logger.warn( 'IRC Constant ' + Constants.IRC[ message.command ] + ' handler defined with no associated actions' );
    }
    public ERR_NICKCOLLISION( message: any ): void {
      this.network.bot.Logger.warn( 'IRC Constant ' + Constants.IRC[ message.command ] + ' handler defined with no associated actions' );
    }
    public ERR_USERNOTINCHANNEL( message: any ): void {
      this.network.bot.Logger.warn( 'IRC Constant ' + Constants.IRC[ message.command ] + ' handler defined with no associated actions' );
    }
    public ERR_NOTONCHANNEL( message: any ): void {
      this.network.bot.Logger.warn( 'IRC Constant ' + Constants.IRC[ message.command ] + ' handler defined with no associated actions' );
    }
    public ERR_USERONCHANNEL( message: any ): void {
      this.network.bot.Logger.warn( 'IRC Constant ' + Constants.IRC[ message.command ] + ' handler defined with no associated actions' );
    }
    public ERR_NOLOGIN( message: any ): void {
      this.network.bot.Logger.warn( 'IRC Constant ' + Constants.IRC[ message.command ] + ' handler defined with no associated actions' );
    }
    public ERR_SUMMONDISABLED( message: any ): void {
      this.network.bot.Logger.warn( 'IRC Constant ' + Constants.IRC[ message.command ] + ' handler defined with no associated actions' );
    }
    public ERR_USERSDISABLED( message: any ): void {
      this.network.bot.Logger.warn( 'IRC Constant ' + Constants.IRC[ message.command ] + ' handler defined with no associated actions' );
    }
    public ERR_NOTREGISTERED( message: any ): void {
      this.network.bot.Logger.warn( 'IRC Constant ' + Constants.IRC[ message.command ] + ' handler defined with no associated actions' );
    }
    public ERR_NEEDMOREPARAMS( message: any ): void {
      this.network.bot.Logger.warn( 'IRC Constant ' + Constants.IRC[ message.command ] + ' handler defined with no associated actions' );
    }
    public ERR_ALREADYREGISTRED( message: any ): void {
      this.network.bot.Logger.warn( 'IRC Constant ' + Constants.IRC[ message.command ] + ' handler defined with no associated actions' );
    }
    public ERR_NOPERMFORHOST( message: any ): void {
      this.network.bot.Logger.warn( 'IRC Constant ' + Constants.IRC[ message.command ] + ' handler defined with no associated actions' );
    }
    public ERR_PASSWDMISMATCH( message: any ): void {
      this.network.bot.Logger.warn( 'IRC Constant ' + Constants.IRC[ message.command ] + ' handler defined with no associated actions' );
    }
    public ERR_YOUREBANNEDCREEP( message: any ): void {
      this.network.bot.Logger.warn( 'IRC Constant ' + Constants.IRC[ message.command ] + ' handler defined with no associated actions' );
    }
    public ERR_KEYSET( message: any ): void {
      this.network.bot.Logger.warn( 'IRC Constant ' + Constants.IRC[ message.command ] + ' handler defined with no associated actions' );
    }
    public ERR_CHANNELISFULL( message: any ): void {
      this.network.bot.Logger.warn( 'IRC Constant ' + Constants.IRC[ message.command ] + ' handler defined with no associated actions' );
    }
    public ERR_UNKNOWNMODE( message: any ): void {
      this.network.bot.Logger.warn( 'IRC Constant ' + Constants.IRC[ message.command ] + ' handler defined with no associated actions' );
    }
    public ERR_INVITEONLYCHAN( message: any ): void {
      this.network.bot.Logger.warn( 'IRC Constant ' + Constants.IRC[ message.command ] + ' handler defined with no associated actions' );
    }
    public ERR_BANNEDFROMCHAN( message: any ): void {
      this.network.bot.Logger.warn( 'IRC Constant ' + Constants.IRC[ message.command ] + ' handler defined with no associated actions' );
    }
    public ERR_BADCHANNELKEY( message: any ): void {
      this.network.bot.Logger.warn( 'IRC Constant ' + Constants.IRC[ message.command ] + ' handler defined with no associated actions' );
    }
    public ERR_NOPRIVILEGES( message: any ): void {
      this.network.bot.Logger.warn( 'IRC Constant ' + Constants.IRC[ message.command ] + ' handler defined with no associated actions' );
    }
    public ERR_CHANOPRIVSNEEDED( message: any ): void {
      this.network.bot.Logger.warn( 'IRC Constant ' + Constants.IRC[ message.command ] + ' handler defined with no associated actions' );
    }
    public ERR_CANTKILLSERVER( message: any ): void {
      this.network.bot.Logger.warn( 'IRC Constant ' + Constants.IRC[ message.command ] + ' handler defined with no associated actions' );
    }
    public ERR_NOOPERHOST( message: any ): void {
      this.network.bot.Logger.warn( 'IRC Constant ' + Constants.IRC[ message.command ] + ' handler defined with no associated actions' );
    }
    public ERR_UMODEUNKNOWNFLAG( message: any ): void {
      this.network.bot.Logger.warn( 'IRC Constant ' + Constants.IRC[ message.command ] + ' handler defined with no associated actions' );
    }
    public ERR_USERSDONTMATCH( message: any ): void {
      this.network.bot.Logger.warn( 'IRC Constant ' + Constants.IRC[ message.command ] + ' handler defined with no associated actions' );
    }
    public RPL_NONE( message: any ): void {
      this.network.bot.Logger.warn( 'IRC Constant ' + Constants.IRC[ message.command ] + ' handler defined with no associated actions' );
    }
    public RPL_USERHOST( message: any ): void {
      this.network.bot.Logger.warn( 'IRC Constant ' + Constants.IRC[ message.command ] + ' handler defined with no associated actions' );
    }
    public RPL_ISON( message: any ): void {
      this.network.bot.Logger.warn( 'IRC Constant ' + Constants.IRC[ message.command ] + ' handler defined with no associated actions' );
    }
    public RPL_AWAY( message: any ): void {
      this.network.bot.Logger.warn( 'IRC Constant ' + Constants.IRC[ message.command ] + ' handler defined with no associated actions' );
    }
    public RPL_UNAWAY( message: any ): void {
      this.network.bot.Logger.warn( 'IRC Constant ' + Constants.IRC[ message.command ] + ' handler defined with no associated actions' );
    }
    public RPL_NOWAWAY( message: any ): void {
      this.network.bot.Logger.warn( 'IRC Constant ' + Constants.IRC[ message.command ] + ' handler defined with no associated actions' );
    }
    public RPL_WHOISUSER( message: any ): void {
      this.network.bot.Logger.warn( 'IRC Constant ' + Constants.IRC[ message.command ] + ' handler defined with no associated actions' );
    }
    public RPL_WHOISSERVER( message: any ): void {
      this.network.bot.Logger.warn( 'IRC Constant ' + Constants.IRC[ message.command ] + ' handler defined with no associated actions' );
    }
    public RPL_WHOISOPERATOR( message: any ): void {
      this.network.bot.Logger.warn( 'IRC Constant ' + Constants.IRC[ message.command ] + ' handler defined with no associated actions' );
    }
    public RPL_WHOISIDLE( message: any ): void {
      this.network.bot.Logger.warn( 'IRC Constant ' + Constants.IRC[ message.command ] + ' handler defined with no associated actions' );
    }
    public RPL_ENDOFWHOIS( message: any ): void {
      this.network.bot.Logger.warn( 'IRC Constant ' + Constants.IRC[ message.command ] + ' handler defined with no associated actions' );
    }
    public RPL_WHOISCHANNELS( message: any ): void {
      this.network.bot.Logger.warn( 'IRC Constant ' + Constants.IRC[ message.command ] + ' handler defined with no associated actions' );
    }
    public RPL_WHOWASUSER( message: any ): void {
      this.network.bot.Logger.warn( 'IRC Constant ' + Constants.IRC[ message.command ] + ' handler defined with no associated actions' );
    }
    public RPL_ENDOFWHOWAS( message: any ): void {
      this.network.bot.Logger.warn( 'IRC Constant ' + Constants.IRC[ message.command ] + ' handler defined with no associated actions' );
    }
    public RPL_LISTSTART( message: any ): void {
      this.network.bot.Logger.warn( 'IRC Constant ' + Constants.IRC[ message.command ] + ' handler defined with no associated actions' );
    }
    public RPL_LIST( message: any ): void {
      this.network.bot.Logger.warn( 'IRC Constant ' + Constants.IRC[ message.command ] + ' handler defined with no associated actions' );
    }
    public RPL_LISTEND( message: any ): void {
      this.network.bot.Logger.warn( 'IRC Constant ' + Constants.IRC[ message.command ] + ' handler defined with no associated actions' );
    }
    public RPL_CHANNELMODEIS( message: any ): void {
      this.network.bot.Logger.warn( 'IRC Constant ' + Constants.IRC[ message.command ] + ' handler defined with no associated actions' );
    }
    public RPL_NOTOPIC( message: any ): void {
      this.network.bot.Logger.warn( 'IRC Constant ' + Constants.IRC[ message.command ] + ' handler defined with no associated actions' );
    }

    public RPL_TOPIC( message: any ): void {
      this.network.bot.Logger.warn( 'IRC Constant ' + Constants.IRC[ message.command ] + ' handler defined with no associated actions' );
    }

    public RPL_INVITING( message: any ): void {
      this.network.bot.Logger.warn( 'IRC Constant ' + Constants.IRC[ message.command ] + ' handler defined with no associated actions' );
    }

    public RPL_SUMMONING( message: any ): void {
      this.network.bot.Logger.warn( 'IRC Constant ' + Constants.IRC[ message.command ] + ' handler defined with no associated actions' );
    }

    public RPL_VERSION( message: any ): void {
      this.network.bot.Logger.warn( 'IRC Constant ' + Constants.IRC[ message.command ] + ' handler defined with no associated actions' );
    }

    public RPL_WHOREPLY( message: any ): void {
      this.network.bot.Logger.warn( 'IRC Constant ' + Constants.IRC[ message.command ] + ' handler defined with no associated actions' );
    }

    public RPL_ENDOFWHO( message: any ): void {
      this.network.bot.Logger.warn( 'IRC Constant ' + Constants.IRC[ message.command ] + ' handler defined with no associated actions' );
    }

    public RPL_NAMREPLY( message: any ): void {
      this.RPL_NAMEREPLY( message );
    }

    public RPL_NAMEREPLY( message: any ): void {
      this.network.bot.Logger.warn( 'IRC Constant ' + Constants.IRC[ message.command ] + ' handler defined with no associated actions' );
    }

    public RPL_WHOSPCRPL( message: any ): void {
      this.network.bot.Logger.warn( 'IRC Constant ' + Constants.IRC[ message.command ] + ' handler defined with no associated actions' );
    }

    public RPL_ENDOFNAMES( message: any ): void {
      this.network.bot.Logger.warn( 'IRC Constant ' + Constants.IRC[ message.command ] + ' handler defined with no associated actions' );
    }
    public RPL_LINKS( message: any ): void {
      this.network.bot.Logger.warn( 'IRC Constant ' + Constants.IRC[ message.command ] + ' handler defined with no associated actions' );
    }
    public RPL_ENDOFLINKS( message: any ): void {
      this.network.bot.Logger.warn( 'IRC Constant ' + Constants.IRC[ message.command ] + ' handler defined with no associated actions' );
    }
    public RPL_BANLIST( message: any ): void {
      this.network.bot.Logger.warn( 'IRC Constant ' + Constants.IRC[ message.command ] + ' handler defined with no associated actions' );
    }
    public RPL_ENDOFBANLIST( message: any ): void {
      this.network.bot.Logger.warn( 'IRC Constant ' + Constants.IRC[ message.command ] + ' handler defined with no associated actions' );
    }
    public RPL_INFO( message: any ): void {
      this.network.bot.Logger.warn( 'IRC Constant ' + Constants.IRC[ message.command ] + ' handler defined with no associated actions' );
    }
    public RPL_ENDOFINFO( message: any ): void {
      this.network.bot.Logger.warn( 'IRC Constant ' + Constants.IRC[ message.command ] + ' handler defined with no associated actions' );
    }

    /**
    * Message of the day handlers
    */
    public ERR_NOMOTD( message: any ): void {
      Object.freeze( this.network.motd = [] );
    }
    public RPL_MOTDSTART( message: any ): void {
      this.network.motd = [];
    }
    public RPL_MOTD( message: any ): void {
      this.network.motd.push( message.params[ 1 ] );
    }
    public RPL_ENDOFMOTD( message: any ): void {
      Object.freeze( this.network.motd );
    }


    public RPL_YOUREOPER( message: any ): void {
      this.network.bot.Logger.warn( 'IRC Constant ' + Constants.IRC[ message.command ] + ' handler defined with no associated actions' );
    }
    public RPL_REHASHING( message: any ): void {
      this.network.bot.Logger.warn( 'IRC Constant ' + Constants.IRC[ message.command ] + ' handler defined with no associated actions' );
    }
    public RPL_QLIST( message: any ): void {
      this.network.bot.Logger.warn( 'IRC Constant ' + Constants.IRC[ message.command ] + ' handler defined with no associated actions' );
    }
    public RPL_ENDOFQLIST( message: any ): void {
      this.network.bot.Logger.warn( 'IRC Constant ' + Constants.IRC[ message.command ] + ' handler defined with no associated actions' );
    }
    public RPL_TIME( message: any ): void {
      this.network.bot.Logger.warn( 'IRC Constant ' + Constants.IRC[ message.command ] + ' handler defined with no associated actions' );
    }
    public RPL_USERSSTART( message: any ): void {
      this.network.bot.Logger.warn( 'IRC Constant ' + Constants.IRC[ message.command ] + ' handler defined with no associated actions' );
    }
    public RPL_USERS( message: any ): void {
      this.network.bot.Logger.warn( 'IRC Constant ' + Constants.IRC[ message.command ] + ' handler defined with no associated actions' );
    }
    public RPL_ENDOFUSERS( message: any ): void {
      this.network.bot.Logger.warn( 'IRC Constant ' + Constants.IRC[ message.command ] + ' handler defined with no associated actions' );
    }
    public RPL_NOUSERS( message: any ): void {
      this.network.bot.Logger.warn( 'IRC Constant ' + Constants.IRC[ message.command ] + ' handler defined with no associated actions' );
    }
    public RPL_TRACELINK( message: any ): void {
      this.network.bot.Logger.warn( 'IRC Constant ' + Constants.IRC[ message.command ] + ' handler defined with no associated actions' );
    }
    public RPL_TRACECONNECTING( message: any ): void {
      this.network.bot.Logger.warn( 'IRC Constant ' + Constants.IRC[ message.command ] + ' handler defined with no associated actions' );
    }
    public RPL_TRACEHANDSHAKE( message: any ): void {
      this.network.bot.Logger.warn( 'IRC Constant ' + Constants.IRC[ message.command ] + ' handler defined with no associated actions' );
    }
    public RPL_TRACEUNKNOWN( message: any ): void {
      this.network.bot.Logger.warn( 'IRC Constant ' + Constants.IRC[ message.command ] + ' handler defined with no associated actions' );
    }
    public RPL_TRACEOPERATOR( message: any ): void {
      this.network.bot.Logger.warn( 'IRC Constant ' + Constants.IRC[ message.command ] + ' handler defined with no associated actions' );
    }
    public RPL_TRACEUSER( message: any ): void {
      this.network.bot.Logger.warn( 'IRC Constant ' + Constants.IRC[ message.command ] + ' handler defined with no associated actions' );
    }
    public RPL_TRACESERVER( message: any ): void {
      this.network.bot.Logger.warn( 'IRC Constant ' + Constants.IRC[ message.command ] + ' handler defined with no associated actions' );
    }
    public RPL_TRACENEWTYPE( message: any ): void {
      this.network.bot.Logger.warn( 'IRC Constant ' + Constants.IRC[ message.command ] + ' handler defined with no associated actions' );
    }
    public RPL_TRACELOG( message: any ): void {
      this.network.bot.Logger.warn( 'IRC Constant ' + Constants.IRC[ message.command ] + ' handler defined with no associated actions' );
    }
    public RPL_STATSLINKINFO( message: any ): void {
      this.network.bot.Logger.warn( 'IRC Constant ' + Constants.IRC[ message.command ] + ' handler defined with no associated actions' );
    }
    public RPL_STATSCOMMANDS( message: any ): void {
      this.network.bot.Logger.warn( 'IRC Constant ' + Constants.IRC[ message.command ] + ' handler defined with no associated actions' );
    }
    public RPL_STATSCLINE( message: any ): void {
      this.network.bot.Logger.warn( 'IRC Constant ' + Constants.IRC[ message.command ] + ' handler defined with no associated actions' );
    }
    public RPL_STATSNLINE( message: any ): void {
      this.network.bot.Logger.warn( 'IRC Constant ' + Constants.IRC[ message.command ] + ' handler defined with no associated actions' );
    }
    public RPL_STATSILINE( message: any ): void {
      this.network.bot.Logger.warn( 'IRC Constant ' + Constants.IRC[ message.command ] + ' handler defined with no associated actions' );
    }
    public RPL_STATSKLINE( message: any ): void {
      this.network.bot.Logger.warn( 'IRC Constant ' + Constants.IRC[ message.command ] + ' handler defined with no associated actions' );
    }
    public RPL_STATSYLINE( message: any ): void {
      this.network.bot.Logger.warn( 'IRC Constant ' + Constants.IRC[ message.command ] + ' handler defined with no associated actions' );
    }
    public RPL_ENDOFSTATS( message: any ): void {
      this.network.bot.Logger.warn( 'IRC Constant ' + Constants.IRC[ message.command ] + ' handler defined with no associated actions' );
    }
    public RPL_STATSLLINE( message: any ): void {
      this.network.bot.Logger.warn( 'IRC Constant ' + Constants.IRC[ message.command ] + ' handler defined with no associated actions' );
    }
    public RPL_STATSUPTIME( message: any ): void {
      this.network.bot.Logger.warn( 'IRC Constant ' + Constants.IRC[ message.command ] + ' handler defined with no associated actions' );
    }
    public RPL_STATSOLINE( message: any ): void {
      this.network.bot.Logger.warn( 'IRC Constant ' + Constants.IRC[ message.command ] + ' handler defined with no associated actions' );
    }
    public RPL_STATSHLINE( message: any ): void {
      this.network.bot.Logger.warn( 'IRC Constant ' + Constants.IRC[ message.command ] + ' handler defined with no associated actions' );
    }
    public RPL_UMODEIS( message: any ): void {
      this.network.bot.Logger.warn( 'IRC Constant ' + Constants.IRC[ message.command ] + ' handler defined with no associated actions' );
    }
    public RPL_LUSERCLIENT( message: any ): void {
      this.network.bot.Logger.warn( 'IRC Constant ' + Constants.IRC[ message.command ] + ' handler defined with no associated actions' );
    }
    public RPL_LUSEROP( message: any ): void {
      this.network.bot.Logger.warn( 'IRC Constant ' + Constants.IRC[ message.command ] + ' handler defined with no associated actions' );
    }
    public RPL_LUSERUNKNOWN( message: any ): void {
      this.network.bot.Logger.warn( 'IRC Constant ' + Constants.IRC[ message.command ] + ' handler defined with no associated actions' );
    }
    public RPL_LUSERCHANNELS( message: any ): void {
      this.network.bot.Logger.warn( 'IRC Constant ' + Constants.IRC[ message.command ] + ' handler defined with no associated actions' );
    }
    public RPL_LUSERME( message: any ): void {
      this.network.bot.Logger.warn( 'IRC Constant ' + Constants.IRC[ message.command ] + ' handler defined with no associated actions' );
    }
    public RPL_ADMINME( message: any ): void {
      this.network.bot.Logger.warn( 'IRC Constant ' + Constants.IRC[ message.command ] + ' handler defined with no associated actions' );
    }
    public RPL_ADMINLOC1( message: any ): void {
      this.network.bot.Logger.warn( 'IRC Constant ' + Constants.IRC[ message.command ] + ' handler defined with no associated actions' );
    }
    public RPL_ADMINLOC2( message: any ): void {
      this.network.bot.Logger.warn( 'IRC Constant ' + Constants.IRC[ message.command ] + ' handler defined with no associated actions' );
    }
    public RPL_ADMINEMAIL( message: any ): void {
      this.network.bot.Logger.warn( 'IRC Constant ' + Constants.IRC[ message.command ] + ' handler defined with no associated actions' );
    }
    public RPL_MONONLINE( message: any ): void {
      this.network.bot.Logger.warn( 'IRC Constant ' + Constants.IRC[ message.command ] + ' handler defined with no associated actions' );
    }
    public RPL_MONOFFLINE( message: any ): void {
      this.network.bot.Logger.warn( 'IRC Constant ' + Constants.IRC[ message.command ] + ' handler defined with no associated actions' );
    }
    public RPL_MONLIST( message: any ): void {
      this.network.bot.Logger.warn( 'IRC Constant ' + Constants.IRC[ message.command ] + ' handler defined with no associated actions' );
    }
    public RPL_ENDOFMONLIST( message: any ): void {
      this.network.bot.Logger.warn( 'IRC Constant ' + Constants.IRC[ message.command ] + ' handler defined with no associated actions' );
    }
    public ERR_MONLISTFULL( message: any ): void {
      this.network.bot.Logger.warn( 'IRC Constant ' + Constants.IRC[ message.command ] + ' handler defined with no associated actions' );
    }
    public RPL_SASLLOGIN( message: any ): void {
      this.network.bot.Logger.warn( 'IRC Constant ' + Constants.IRC[ message.command ] + ' handler defined with no associated actions' );
    }
    public RPL_SASLSUCCESS( message: any ): void {
      this.network.bot.Logger.warn( 'IRC Constant ' + Constants.IRC[ message.command ] + ' handler defined with no associated actions' );
    }
    public RPL_SASLFAILED( message: any ): void {
      this.network.bot.Logger.warn( 'IRC Constant ' + Constants.IRC[ message.command ] + ' handler defined with no associated actions' );
    }
    public RPL_SASLERROR( message: any ): void {
      this.network.bot.Logger.warn( 'IRC Constant ' + Constants.IRC[ message.command ] + ' handler defined with no associated actions' );
    }
    public RPL_SASLABORT( message: any ): void {
      this.network.bot.Logger.warn( 'IRC Constant ' + Constants.IRC[ message.command ] + ' handler defined with no associated actions' );
    }
    public RPL_SASLALREADYAUTH( message: any ): void {
      this.network.bot.Logger.warn( 'IRC Constant ' + Constants.IRC[ message.command ] + ' handler defined with no associated actions' );
    }

    private PING( message: any ): void {
      this.network.connection.pong( message.params[ 0 ] );
    }

    private CAP( message: any ): void {
      // thanks Kiwi
      var capabilities = message.params[ message.params.length - 1 ].replace( /(?:^| )[\-~=]/, '' ).split( ' ' );

      if ( !this.network.sasl ) {
        _.remove( capabilities, ( cap ) => {
          return cap === 'sasl';
        } );
      }

      console.log( capabilities );

      switch( message.params[ 1 ] ) {
        case 'LS':
          if ( capabilities.length ) {
            this.network.connection.capabilities.requested = capabilities;
            this.network.connection.send_cap_req( capabilities.join( ' ' ) );
          }
          else {
            this.network.connection.send_cap_end();
          }
          break;
          case 'ACK':
            if ( capabilities.length ) {
                // Update list of enabled capabilities
                this.network.connection.capabilities.enabled = capabilities;
                // Update list of capabilities we would like to have but that aren't enabled
                this.network.connection.capabilities.requested = _.difference( this.network.connection.capabilities.requested, capabilities );
            }
            if ( this.network.connection.capabilities.enabled.length ) {
                if ( _.contains( this.network.connection.capabilities.enabled, 'sasl' ) ) {
                  this.network.send( 'AUTHENTICATE PLAIN' );
                }
                else {
                  this.network.connection.send_cap_end();
                }
            }
            break;
        case 'NAK':
            if ( capabilities.length ) {
                this.network.connection.capabilities.requested = _.difference( this.network.connection.capabilities.requested, capabilities );
            }
            if ( this.network.connection.capabilities.requested.length ) {
                this.network.connection.send_cap_end();
            }
            break;
        case 'LIST':
            // should we do anything here?
            break;
      }
    }

    private JOIN( message: any ): void {
      delete message.network;
      console.log( 'join', message );
    }


}
