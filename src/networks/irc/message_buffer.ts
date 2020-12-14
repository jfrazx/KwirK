'use strict';

import { IrcMessageHandler } from './irc-message-handler';
import { IrcConnection } from './irc_connection';
import { Socket } from 'net';
import { TLSSocket } from 'tls';
import * as iconv from 'iconv-lite';

export class MessageBuffer {
  private messageHandler: IrcMessageHandler;

  /**
   * 1024 bytes is the maximum length of two RFC1459 IRC messages.
   * May need tweaking when IRCv3 message tags are more widespread
   */
  private static MAX_BUFFER = 1024;
  public static LINE_END = '\r\n';

  constructor(
    public connection: IrcConnection,
    private encoding: string = 'utf8',
  ) {
    this.messageHandler = new IrcMessageHandler(connection.network);
  }

  /**
   *
   *
   * @param {(Socket | TLSSocket)} socket
   * @returns {MessageBuffer}
   * @memberof MessageBuffer
   */
  public handleData(socket: Socket | TLSSocket): void {
    let buffer = '';

    const converterStream = iconv.decodeStream(this.encoding);

    socket.pipe(converterStream);

    converterStream.on('data', (data: string) => {
      console.log(`data received: ${data}`);
      buffer += data;

      let boundary = buffer.indexOf(MessageBuffer.LINE_END);

      console.log(`initial boundary: ${boundary}`);

      while (boundary !== -1) {
        const line = buffer.substring(0, boundary);

        buffer = buffer.substring(boundary + 1);
        boundary = buffer.indexOf(MessageBuffer.LINE_END);

        console.log(`line: ${line}`);
        console.log(`buffer: ${buffer}`);
        console.log(`new boundary: ${boundary}`);

        this.connection.network.bot.emit(
          `parse_message::${this.connection.network.name}`,
          line,
        );
      }
    });
  }

  public decode(message: Buffer, encoding = this.encoding): string {
    return iconv.decode(message, encoding);
  }

  public encode(message: string, encoding = this.encoding): Buffer {
    return iconv.encode(message, encoding);
  }

  public setEncoding(encoding: string): boolean {
    if (iconv.encodingExists(encoding)) {
      this.encoding = encoding;
    }

    return iconv.encodingExists(encoding);
  }

  private maxBufferError(): void {
    this.connection.network.bot.emit(
      'error',
      new Error('Message buffer too large'),
    );
    this.connection.socket.destroy();
    this.connection.network.bot.emit(
      `jump::${this.connection.network.name}`,
      'message buffer overflow',
    );
  }
}
