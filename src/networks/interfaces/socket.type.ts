import { Socket as ClearSocket } from 'net';
import { TLSSocket } from 'tls';

export type Socket = ClearSocket | TLSSocket;
