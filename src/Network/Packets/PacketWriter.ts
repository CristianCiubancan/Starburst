import { logger } from '../../Services/LoggingService';

// Helper function to write 7-bit encoded integer
function write7BitEncodedInt(writer: PacketWriter, value: number): void {
  let v = value;
  while (v >= 0x80) {
    writer.writeByte((v | 0x80) & 0xff);
    v >>= 7;
  }
  writer.writeByte(v & 0xff);
}
class PacketWriter {
  private buffer: Buffer[];
  private lengthPlaceholder: Buffer;
  private disposed: boolean;

  constructor() {
    this.buffer = [];
    this.lengthPlaceholder = Buffer.alloc(2); // Placeholder for packet length
    this.buffer.push(this.lengthPlaceholder);
    this.disposed = false;
  }

  writeUInt16(value: number): void {
    const buf = Buffer.alloc(2);
    buf.writeUInt16LE(value, 0);
    this.buffer.push(buf);
  }

  writeUInt32(value: number): void {
    const buf = Buffer.alloc(4);
    buf.writeUInt32LE(value, 0);
    this.buffer.push(buf);
  }

  writeUInt64(value: bigint): void {
    const buf = Buffer.alloc(8);
    if (typeof value === 'number') {
      logger.error(
        'writeUInt64: value is a number, converting to BigInt',
        value
      );
      value = BigInt(value); // Explicitly convert number to BigInt
    }
    buf.writeBigUInt64LE(value, 0); // Write BigInt as unsigned 64-bit integer
    this.buffer.push(buf);
  }

  writeByte(data: number): void {
    const buf = Buffer.alloc(1);
    buf.writeUInt8(data, 0);
    this.buffer.push(buf);
  }

  writeBytes(value: Buffer): void {
    this.buffer.push(value);
  }

  writeString(value: string, fixedLength: number): void {
    const array = Buffer.alloc(fixedLength);
    array.write(value, 'ascii');
    this.buffer.push(array);
  }

  writeStringList(strings: string[]): void {
    this.buffer.push(Buffer.from([strings.length]));
    for (const str of strings) {
      this.writeStringWithLength(str);
    }
  }

  writeStringWithLength(value: string): void {
    const length = value.length;
    this.buffer.push(Buffer.from([length]));
    this.writeString(value, length);
  }

  writePrefixedString(value: string): void {
    const length = Buffer.byteLength(value, 'ascii');
    write7BitEncodedInt(this, length);
    this.writeString(value, length);
  }

  toBuffer(): Buffer {
    const totalLength = this.buffer.reduce((sum, buf) => sum + buf.length, 0);
    // this.lengthPlaceholder.writeUInt16LE(totalLength, 0);
    return Buffer.concat(this.buffer);
  }

  dispose(): void {
    if (!this.disposed) {
      // No need to close streams in Node.js, just clear the buffer
      this.buffer = [];
      this.disposed = true;
    }
  }
}

export { PacketWriter };
