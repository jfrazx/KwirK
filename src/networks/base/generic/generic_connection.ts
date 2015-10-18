
/**
* @TODO: Utilize this as a base for a new <Generic>Connection
*/

import { Connection, IConnection } from '../connection';
import { GenericServer } from './generic_server';
import { Generic } from './generic_network';

export class GenericConnection extends Connection implements IGenericConnection {

  constructor( public network: Generic, public server: GenericServer ) {
    super( network, server );
  }

  public connect(): void {}

  public dispose(): void {}

  public end(): void {}
}

interface IGenericConnection extends IConnection {

}
