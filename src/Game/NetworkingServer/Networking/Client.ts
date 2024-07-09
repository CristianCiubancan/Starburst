import { BlowfishCipher } from '../../../Network/Security/BlowfishCipher';
import { DiffieHellman } from '../../../Network/Security/DiffieHellman';
import { Connection } from '../../../Network/Sockets/TcpServer';

export class Client {
  characterId?: number;
  creation: boolean;
  diffieHellman: DiffieHellman;
  cipher: BlowfishCipher;
  socket: Connection;
  buffer: Buffer;
  footer: string;

  constructor(
    socket: Connection,
    buffer: Buffer = Buffer.alloc(0),
    footer: string = 'TQServer',
    cipher: BlowfishCipher = new BlowfishCipher()
  ) {
    this.creation = true;
    this.socket = socket;
    this.footer = footer;
    this.cipher = cipher;
    this.buffer = buffer;
    this.diffieHellman = new DiffieHellman();
  }
}
