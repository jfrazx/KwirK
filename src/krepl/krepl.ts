
import { Bot } from '../bot';
import * as repl from 'repl';
import * as _ from 'lodash';
import * as net from 'net';
import * as tls from 'tls';

/**
* @TODO: https://github.com/arjunmehta/node-columns ?
*/
export class KREPL implements IKReplOptions {

  public port: number;
  public host: string;
  public server: tls.Server;
  public prompt: string;
  public input: NodeJS.ReadableStream;
  public output: NodeJS.WritableStream;
  public terminal: boolean;
  public eval: Function;
  public useColors: boolean;
  public useGlobal: boolean;
  public ignoreUndefined: boolean;
  public writer: Function;
  public replMode: symbol;
  public pfx: any;
  public key: any;
  public passphrase: string;
  public cert: any;
  public ca: any;
  public crl: any;
  public ciphers: string;
  public honorCipherOrder: any;
  public requestCert: boolean;
  public rejectUnauthorized: boolean;
  public NPNProtocols: any;
  public SNICallback: (servername: string) => any;

  constructor( public bot: Bot, options?: IKReplOptions ) {
    _.merge( this, _.defaults( options, this.defaults() ) );

    this.server = new tls.Server( this.port, this.host, 511, ( socket: tls.TLSSocket ) => {
      socket.setEncoding('utf8');
      socket.on( 'data', ( data: any ) => {
        console.log( data );
      });
    });

  }

  /**
  * The default kREPL values
  * @return <IKReplOptions>
  */
  private defaults(): IKReplOptions {
    return {
      port: 31415,
      host: '0.0.0.0',
      prompt: '<kwirk::repl> ',
      input: null,
      output: null,
      terminal: false,
      eval: null,
      useColors: true,
      useGlobal: false,
      ignoreUndefined: false,
      writer: null,
      replMode: Symbol('repl.REPL_MODE_MAGIC'),
      pfx: null,
      key: null,
      passphrase: null,
      cert: null,
      ca: null,
      crl: null,
      ciphers: null,
      honorCipherOrder: true,
      requestCert: false,
      rejectUnauthorized: false,
      NPNProtocols: null,
      SNICallback: null
    };
  }
}

export interface IKReplOptions extends tls.TlsOptions, repl.ReplOptions {
  port?: number;
  host?: string;
}
