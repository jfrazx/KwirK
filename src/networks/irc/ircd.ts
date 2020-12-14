
import { Irc } from './irc';

/**
* This class is intended for the storage of IRCD registration information
* and determining IRCD type, in the hope of possibly responding
* more appropriately to different IRCD event interpretations
*/

/**
* @todo everything
*/

export class Ircd {

  public motd: string[];


  constructor(public network: Irc) {

  }
}
