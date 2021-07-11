import { IrcConnection } from './irc_connection';

export class IrcErrorHandler {
  constructor(private connection: IrcConnection) {}

  handle(e: any): void {
    this.error(`an ${e.code} error occurred`, e);

    switch (e.code) {
      case 'ECONNRESET':
      case 'EPIPE':
        return this.connection.reconnect();
      case 'ENETUNREACH':
      case 'ENOTFOUND':
        this.connection.server.disable();
        return this.connection.network.jump();

      case 'ETIMEDOUT':
        if (this.connection.reconnectAttempts >= this.connection.network.connectionAttempts) {
          this.connection.server.disable();
          this.connection.reconnectAttempts = 0;
          return this.connection.network.jump();
        }

        this.connection.reconnectAttempts++;
        this.connection.reconnect();
        break;
      default: {
        this.error('an unhandled error occurred', e);
      }
    }
  }

  private error(message: string, ...args: any[]): void {
    this.connection.network.bot.Logger.error(message, ...args);
  }
}
