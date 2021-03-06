
/**
* @TODO: Utilize this as a base for a new <Generic>Server
*/

import { Server, IServer, IServerOptions } from '../server';
import { Generic } from './generic_network';

export class GenericServer extends Server implements IGenericServer {

  constructor( public network: Generic, options: IGenericServerOptions ) {
    super( network, options.host, null );
  }

  public disable(): void {}

  public dispose(): void {}

}

interface IGenericServer extends IServer, IGenericServerOptions {

}

interface IGenericServerOptions extends IServerOptions {

}
