import { SurrogateMethods, SurrogateDelegate, SurrogatePre, NextHandler } from 'surrogate';
import { IrcErrorHandler } from './irc_error_handler';
import { MessageBuffer } from './message_buffer';
import { Connection } from '../base/connection';
import { Timer } from '../../utilities/timer';
import { IConnection } from '../interfaces';
import { IrcServer } from './irc_server';
import { Handler } from './handler';
import { Socket } from 'net';
import * as _ from 'lodash';
import { Irc } from './irc';
import * as tls from 'tls';

export interface IrcConnection extends SurrogateMethods<IrcConnection> {}

@SurrogateDelegate()
export class IrcConnection extends Connection<Irc> implements IIrcConnection {
  private static MIN_PING = 15000;
  private static MAX_PING = 300000;
  private static DEFAULT_DELAY = 5000;
  private static DEFAULT_PING = 120000;
  private static MAX_RECONNECT = Math.pow(8, 7);

  public reconnectAttempts = 0;
  public request_disconnect: boolean;
  public capabilities: { requested: string[]; enabled: string[] } = {
    requested: [],
    enabled: [],
  };
  public registered: boolean;
  public server: IrcServer;

  private reconnect_timer: Timer;
  private handler: Handler;
  private pong_timer: Timer;
  private _ping_delay: number;
  private messageBuffer: MessageBuffer;
  public reconnect_delay: number = IrcConnection.DEFAULT_DELAY;

  private errorHandler = new IrcErrorHandler(this);

  constructor(public network: Irc, { pingDelay }: IrcConnectionOptions) {
    super(network);

    this.pingDelay = pingDelay;
    this.handler = new Handler(this.network);
    this.messageBuffer = new MessageBuffer(this);
    this.reconnect_timer = this.network.Timer(
      {
        infinite: false,
        interval: this.reconnect_delay,
        namespace: this.network.name,
        reference: `reconnect_timer`,
      },
      this.network.connect.bind(this.network),
    );

    this.setupListeners();
  }

  @SurrogatePre<IrcConnection>([
    {
      handler: ({ next, instance }: NextHandler<IrcConnection>) =>
        next.next({
          bail: instance.isConnected(),
          bailWith: null,
        }),
    },
    {
      handler(this: IrcConnection) {
        this.network.bot.Logger.info(
          `Attempting connection for network ${this.network.name} on server ${this.server.host} using ${
            this.server.ssl ? 'secure' : 'clear'
          } channel`,
        );

        this.request_disconnect = false;
        this.registered = false;

        this.handler.setRegistrationListener(this.network.reg_listen);
      },
      options: {
        useNext: false,
      },
    },
  ])
  public connect(callback?: Function): void {
    if (this.isConnected()) {
      this.emit(`network_already_connected::${this.network.name}`, this.network, this.server);
      return callback && callback(null);
    }

    this.createSocket();

    this.socket
      .on(this.connectionEvent(), this.connectionSetup.bind(this))
      .on('error', this.onError.bind(this));

    callback?.(null);
  }

  private connectionEvent(): string {
    return this.server.ssl ? 'secureConnect' : 'connect';
  }

  private createSocket(): void {
    if (this.server.ssl) {
      this.socket = tls.connect({
        rejectUnauthorized: this.network.reject_invalid_certs,
        host: this.server.host,
        port: this.server.port,
      });
    } else {
      this.socket = new Socket();
      this.socket.connect(this.server.port, this.server.host);
    }
  }

  get pingDelay(): number {
    return this._ping_delay;
  }

  set pingDelay(delay: number) {
    const toMilliseconds = delay * 1000;

    if (this.invalidPing(toMilliseconds, delay)) {
      delay = IrcConnection.DEFAULT_PING;
    } else if (delay < IrcConnection.MIN_PING && toMilliseconds <= IrcConnection.MAX_PING) {
      delay = toMilliseconds;
    }

    this._ping_delay = Math.floor(delay);

    if (this.pong_timer) {
      this.pong_timer.restart(this.pingDelay);
    }
  }

  private invalidPing(milli: number, delay: number): boolean {
    return (
      !milli ||
      (delay < IrcConnection.MIN_PING &&
        !_.inRange(milli, IrcConnection.MIN_PING, IrcConnection.MAX_PING)) ||
      delay > IrcConnection.MAX_PING
    );
  }

  private connectionSetup(): void {
    this.pipeSetup();

    this._connected = true;

    this.sendCapLs();
    this.sendLogin();

    // this.socket.on('data', this.messageBuffer.onData.bind(this.messageBuffer));

    this.messageBuffer.handleData(this.socket);

    this.socket.on('end', this.onEnd.bind(this));
    this.socket.on('close', this.onClose.bind(this));

    this.network.bot.emit(`connect::${this.network.name}`, this.network, this.server);
  }

  private pipeSetup(): void {
    this.buffer.pipe(this.socket);
    this.buffer.on('pause', () => {
      this.buffer.once('drain', () => {
        this.buffer.resume();
      });
    });
  }

  /**
   * Disconnect from the network
   * @param <string> message: The quit message to send
   * @return <void>
   */
  public disconnect(callback?: Function): void;
  public disconnect(message?: string): void;
  public disconnect(message: string, callback: Function): void;
  public disconnect(message: any = this.network.quit_message, callback?: Function): void {
    if (typeof message === 'function') {
      callback = message;
      message = this.network.quit_message;
    }

    if (!this.isConnected() && !this.socket) {
      return callback && callback(null);
    }

    this.request_disconnect = true;

    this.send(`QUIT :${message}`);
    this.send(null);

    setTimeout(() => {
      process.nextTick(this.end.bind(this));
    }, 100);

    callback && callback(null);
  }

  public dispose(): void {
    this.isConnected() && this.disconnect();

    this.reconnect_timer && this.reconnect_timer.stop();
    this.socket && this.end();

    this.network.dispose();

    if (this.pong_timer) {
      this.pong_timer.stop();
      this.pong_timer = null;
    }

    this.server && this.server.dispose();
    this.server = null;
  }

  public end(): void {
    this.network.clearTimers();
    this.buffer.unpipe(this.socket);
    this.disposeSocket();
  }

  // more on this later...
  public send(data: string, callback?: Function): void {
    if (this.isConnected() && this.socket) this.buffer.push(data + '\r\n');
  }

  /**
   * Called when the socket connection is closed
   * @param <boolean> error: Did the socket connection close because of an error?
   * @return <void>
   */
  private onClose(error: boolean): void {
    this._connected = false;

    if (!this.request_disconnect) {
      this.reconnect();
    }
  }

  /**
   * Called if the socket has an error
   * @param <any> e: The Error type objct that gets passed
   * @return <void>
   * @private
   */
  private onError(e: any): void {
    this._connected = false;

    this.errorHandler.handle(e);
  }

  /**
   * Setup the reconnect timer to delay reconnection to the current server
   * @return <void>
   */
  reconnect(): void {
    this._connected = false;
    this.reconnect_delay = this.reconnect_delay * (this.reconnectAttempts + 1) || this.reconnect_delay;

    if (this.reconnect_delay > IrcConnection.MAX_RECONNECT) {
      this.reconnect_delay = IrcConnection.MAX_RECONNECT;
    }

    this.info(
      `setting timer to delay ${this.server.host} reconnection for ${
        this.reconnect_delay / 1000
      } seconds on network ${this.network.name}`,
    );

    this.reconnect_timer.interval = this.reconnect_delay;
    this.reconnect_timer.start();
  }

  /**
   * What to do after a successful registration
   * @return <void>
   */
  private onRegistered(_network: Irc): void {
    this.registered = true;
    this.reconnectAttempts = 0;
    this.reconnect_delay = IrcConnection.DEFAULT_DELAY;

    if (this.network.use_ping_timer) {
      this.pong_timer = this.network.Timer(
        {
          interval: this.pingDelay,
          autoStart: true,
          blocking: false,
          ignoreErrors: true,
          immediate: true,
          emitLevel: 0,
          namespace: this.network.name,
          reference: 'pong',
          stopOn: `disconnect::${this.network.name}`,
          restartOn: `registered::${this.network.name}`,
        },
        this.pong.bind(this),
      );
    }
  }

  private onEnd(): void {
    this._connected = false;

    if (this.request_disconnect) {
    } else {
      // do things to reconnect (should we assume or have a reconnect: boolean setting ?)
    }
  }

  /**
   * Sends a PONG message to the IRC server
   * @param <string> message: the message to include
   * @return <void>
   */
  public pong(done?: Function): void;
  public pong(message: string, done?: Function): void;
  public pong(message?: any, done?: Function): void {
    if (typeof message === 'function') {
      done = message;
      message = null;
    }

    message = message || this.server.host;

    if (!this.socket || this.disconnected()) {
      this.pong_timer && this.pong_timer.stop();
    }

    this.send(`PONG ${message}`);

    if (done) {
      done();
    }
  }

  /**
   * Send a CAP LIST to the IRC server
   * @return <void>
   */
  private sendCapLs(): void {
    this.send('CAP LS 302');
  }

  /**
   * Send a CAP REQ to the IRC server
   * @param <string> capabilities: The capabilities to request from the Server
   * @return <void>
   */
  public sendCapReq(capabilities: string = ''): void {
    this.send(`CAP REQ :${capabilities}`);
  }

  /**
   * End the CAP negotiations
   * @return <void>
   */
  public sendCapEnd(): void {
    this.send('CAP END');
  }

  private setupListeners(): void {
    this.network.bot.on(`registered::${this.network.name}`, this.onRegistered.bind(this));
  }

  /**
   * Send login information to the IRC server
   * @return <void>
   */
  private sendLogin(): void {
    this.nick = this.network.generateNick();

    this.send(`NICK ${this.nick}`);
    this.send(
      `USER ${this.network.user_name} ${this.network.modes.includes('i') ? '8' : '0'}" * :${
        this.network.real_name
      }`,
    );
  }

  private sendPassword(): void {
    const password = this.server.password || this.network.password;
    if (password) {
      this.send(`PASS ${password}`);
    }
  }

  private emit(event: string, ...args: any[]): void {
    this.network.bot.emit(event, ...args);
  }

  private info(message: string): void {
    this.network.bot.Logger.info(message);
  }
}

export interface IIrcConnection extends IConnection<Irc> {
  reconnectAttempts: number;
}

export interface IrcConnectionOptions {
  pingDelay?: number;
}
