import { ICipher } from './ICipher';

export class RC5 implements ICipher {
  private static readonly WordSize: number = 16;
  private static readonly Rounds: number = 12;
  private static readonly KeySize: number = RC5.WordSize / 4;
  private static readonly SubSize: number = 2 * (RC5.Rounds + 1);

  private readonly Key: Uint32Array;
  private readonly Sub: Uint32Array;

  constructor() {
    this.Key = new Uint32Array(RC5.KeySize);
    this.Sub = new Uint32Array(RC5.SubSize);
    this.generateKeys([
      new Uint8Array([
        0x3c, 0xdc, 0xfe, 0xe8, 0xc4, 0x54, 0xd6, 0x7e, 0x16, 0xa6, 0xf8, 0x1a,
        0xe8, 0xd0, 0x38, 0xbe,
      ]),
    ]);
  }

  generateKeys(seeds: any[]): void {
    const seedBuffer = seeds[0] as Uint8Array;
    const seedLength =
      Math.floor(seedBuffer.length / RC5.WordSize) * RC5.WordSize;

    for (let i = 0; i < RC5.KeySize; i++) {
      this.Key[i] = new DataView(seedBuffer.buffer).getUint32(i * 4, true);
    }

    this.Sub[0] = 0xb7e15163;
    for (let i = 1; i < RC5.SubSize; i++) {
      this.Sub[i] = (this.Sub[i - 1] + 0x9e3779b9) >>> 0; // Equivalent to subtracting 0x61C88647
    }

    let a = 0,
      b = 0;
    for (let x = 0, i = 0, j = 0; x < 3 * RC5.SubSize; x++) {
      a = this.Sub[i] = this.rotateLeft((this.Sub[i] + a + b) >>> 0, 3);
      b = this.Key[j] = this.rotateLeft(
        (this.Key[j] + a + b) >>> 0,
        (a + b) & 0x1f
      );
      i = (i + 1) % RC5.SubSize;
      j = (j + 1) % RC5.KeySize;
    }
  }

  decrypt(src: Buffer, dst: Buffer): void {
    const length = Math.ceil(src.length / 8);
    src.copy(dst);

    for (let word = 0; word < length; word++) {
      let a = dst.readUInt32LE(8 * word);
      let b = dst.readUInt32LE(8 * word + 4);

      for (let round = RC5.Rounds; round > 0; round--) {
        b = this.rotateRight((b - this.Sub[2 * round + 1]) >>> 0, a & 0x1f) ^ a;
        a = this.rotateRight((a - this.Sub[2 * round]) >>> 0, b & 0x1f) ^ b;
      }

      dst.writeUInt32LE((a - this.Sub[0]) >>> 0, 8 * word);
      dst.writeUInt32LE((b - this.Sub[1]) >>> 0, 8 * word + 4);
    }
  }

  encrypt(src: Buffer, dst: Buffer): void {
    const length = Math.ceil(src.length / 8);
    dst.fill(0);
    src.copy(dst);

    for (let word = 0; word < length; word++) {
      let a = (dst.readUInt32LE(8 * word) + this.Sub[0]) >>> 0;
      let b = (dst.readUInt32LE(8 * word + 4) + this.Sub[1]) >>> 0;

      for (let round = 1; round <= RC5.Rounds; round++) {
        a = this.rotateLeft((a ^ b) >>> 0, b & 0x1f) + this.Sub[2 * round];
        b = this.rotateLeft((b ^ a) >>> 0, a & 0x1f) + this.Sub[2 * round + 1];
      }

      dst.writeUInt32LE(a >>> 0, 8 * word);
      dst.writeUInt32LE(b >>> 0, 8 * word + 4);
    }
  }

  private rotateLeft(value: number, shift: number): number {
    return ((value << shift) | (value >>> (32 - shift))) >>> 0;
  }

  private rotateRight(value: number, shift: number): number {
    return ((value >>> shift) | (value << (32 - shift))) >>> 0;
  }
}
