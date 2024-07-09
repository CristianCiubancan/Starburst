import { Buffer } from 'buffer';

class PacketReader {
  private buffer: Buffer;
  private offset: number;

  constructor(bytes: Buffer) {
    this.buffer = bytes;
    this.offset = 0;
  }

  readInt32(): number {
    const value = this.buffer.readInt32LE(this.offset);
    this.offset += 4;
    return value;
  }
  seek(offset: number, position: 'start' | 'current'): void {
    switch (position) {
      case 'start':
        this.offset = offset;
        break;
      case 'current':
        this.offset += offset;
        break;
      default:
        throw new Error(`Invalid position: ${position}`);
    }
  }

  readUInt16(): number {
    const value = this.buffer.readUInt16LE(this.offset);
    this.offset += 2;
    return value;
  }

  readUInt32(): number {
    const value = this.buffer.readUInt32LE(this.offset);
    this.offset += 4;
    return value;
  }

  readUInt64(): bigint {
    const value = this.buffer.readBigUInt64LE(this.offset);
    this.offset += 8;
    return value;
  }

  readBytes(length: number): Buffer {
    const value = this.buffer.slice(this.offset, this.offset + length);
    this.offset += length;
    return value;
  }

  readString(fixedLength: number): string {
    const value = this.buffer
      .toString('ascii', this.offset, this.offset + fixedLength)
      .replace(/\0+$/, '');
    this.offset += fixedLength;
    return value;
  }

  readStringWithLength(): string {
    const length = this.buffer.readUInt8(this.offset);
    this.offset += 1;
    return this.readString(length);
  }

  readStrings(): string[] {
    const amount = this.buffer.readUInt8(this.offset);
    this.offset += 1;
    const strings = [];
    for (let i = 0; i < amount; i++) {
      strings.push(this.readStringWithLength());
    }
    return strings;
  }

  close(): void {
    // No equivalent needed in Node.js, but method kept for consistency
  }

  dispose(): void {
    this.close();
  }
}

export { PacketReader };
