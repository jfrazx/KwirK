
import { Bot } from '../bot';
import { Bind } from './bind';
import { Message } from './message';

export class Router {

  public buffer: Message[];

  constructor( public bot: Bot ) {

  }

  /**
  * Route messages to bindings, listeners and ... more?
  * @param <Message> message: The message to route
  * @return <void>
  */
  public route( message: Message ): void {
    this.bot.Logger.info( `Received message from ${ message.network.name } ${ message.channel ? 'channel ' + message.channel.name : 'user ' + message.user.name }` );
    this.bot.emit( `message::${ message.network.name }`, message );

    this.bindings( message );

    // more to do...
  }

  /**
  * Check message against bindings
  * @param <Message> message: The message to check against
  * @return <void>
  * @private
  */
  private bindings( message: Message ): void {
    /**
    * In the event the message is from an individual, we don't bind user messages
    */
    if ( !message.channel ) return;

    /**
    * The bot should not forward it's own responses
    */
    // if ( message.nick === this.bot.network[ message.network.name ].connection.nick ) return;

    let binds = Bind.binds;

    /**
    * determine if any bindings have been supplied for the source network
    * and if so, is it currently enabled
    */
    if ( binds[ message.network.name ] && binds[ message.network.name ].enable ) {
      let bindings = binds[ message.network.name ].binds;

      /**
      * iterate through the source network bindings to try and find a match
      * @todo I think this needs to be changed
      */
      bindings.forEach( ( bind ) => {

        /**
        * The bind must be enabled
        */
        if ( bind.enabled() ) {
          if ( message.channel.name === bind.channel ) {

            let joinPart = !!message.command.match( /^JOIN|PART$/i );
            let msg: Message = null;
            /**
            * Let the bind determine if the message is a match
            */
            if ( msg = bind.match( message )) {
              /*
              * determine if our destination network and target channel exists
              */
              if ( this.bot.network[ bind.destination ].channelExists( bind.target ) ) {
                msg.bind = bind;
                msg.formatResponse();

                /**
                * Finally send the message to the destination target
                */
                this.bot.network[ bind.destination ].channel[ bind.target ].say( msg.response );
              }
            }

            this.bot.Logger.info( `Router binding match ${ msg ? 'accepted' : 'rejected' } from ${ bind.network }:${ bind.channel } to ${ bind.destination }:${ bind.target } matching: ${ joinPart ? 'JOIN/PART' : message.content }` );
          }
        }
      });
    }
  }
}
