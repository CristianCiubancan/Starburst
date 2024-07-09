import { randomBytes } from 'crypto';
import { DiffieHellman } from '../../Network/Security/DiffieHellman';
import { PacketReader } from '../../Network/Packets/PacketReader';
import { PacketWriter } from '../../Network/Packets/PacketWriter';

export class MsgHandshake {
  public length = 0;
  public decryptionIV?: Buffer;
  public encryptionIV?: Buffer;
  public primeRoot?: string;
  public generator?: string;
  public serverKey?: string;
  public clientKey: string = '';
  private padding: Buffer;

  constructor(
    dh?: DiffieHellman,
    encryptionIV?: Uint8Array,
    decryptionIV?: Uint8Array
  ) {
    this.primeRoot = dh?.primeRoot;
    this.generator = dh?.generator;
    this.serverKey = dh?.publicKey!;
    if (encryptionIV && decryptionIV) {
      this.encryptionIV = Buffer.from(encryptionIV);
      this.decryptionIV = Buffer.from(decryptionIV);
    }
    this.padding = Buffer.alloc(23); // Default padding size
  }

  async randomizeAsync(): Promise<void> {
    this.padding = randomBytes(23);
  }

  decode(buffer: Buffer): void {
    const reader = new PacketReader(buffer);
    reader.seek(7, 'start');
    this.length = reader.readUInt32();
    const paddingLength = reader.readUInt32();

    reader.seek(paddingLength, 'current');

    const intermediaryClientKeyOperation = reader.readUInt32();
    console.log(
      'intermediaryClientKeyOperation:',
      intermediaryClientKeyOperation
    );
    const intermediaryClientKeyOperation2 = reader.readBytes(
      intermediaryClientKeyOperation
    );

    console.log(
      'intermediaryClientKeyOperation2:',
      intermediaryClientKeyOperation2.toString('ascii')
    );

    const intermediaryClientKeyOperation3 =
      intermediaryClientKeyOperation2.toString('ascii');

    console.log(
      'intermediaryClientKeyOperation3:',
      intermediaryClientKeyOperation3
    );

    this.clientKey = intermediaryClientKeyOperation3;
  }

  encode(): Buffer {
    if (
      !this.primeRoot ||
      !this.generator ||
      !this.serverKey ||
      !this.encryptionIV ||
      !this.decryptionIV
    ) {
      throw new Error('Missing DH parameters');
    }

    const writer = new PacketWriter();
    const messageLength =
      36 +
      this.padding.length +
      this.encryptionIV.length +
      this.decryptionIV.length +
      Buffer.byteLength(this.primeRoot) +
      Buffer.byteLength(this.generator) +
      Buffer.byteLength(this.serverKey);

    writer.writeBytes(this.padding.slice(0, 9));
    writer.writeUInt32(messageLength - 11);
    writer.writeUInt32(this.padding.length - 11);
    writer.writeBytes(this.padding.slice(9, this.padding.length - 2)); // Write the middle part of the padding correctly
    writer.writeUInt32(this.encryptionIV.length);
    writer.writeBytes(this.encryptionIV);
    writer.writeUInt32(this.decryptionIV.length);
    writer.writeBytes(this.decryptionIV);
    writer.writeUInt32(Buffer.byteLength(this.primeRoot));
    writer.writeBytes(Buffer.from(this.primeRoot, 'ascii'));
    writer.writeUInt32(Buffer.byteLength(this.generator));
    writer.writeBytes(Buffer.from(this.generator, 'ascii'));
    writer.writeUInt32(Buffer.byteLength(this.serverKey));
    writer.writeBytes(Buffer.from(this.serverKey, 'ascii'));

    return writer.toBuffer();
  }
}
