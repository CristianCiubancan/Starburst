interface ICipher {
  generateKeys(seeds: any[]): void;
  decrypt(src: Uint8Array, dst: Uint8Array): void;
  encrypt(src: Uint8Array, dst: Uint8Array): void;
}

export class TQCipher implements ICipher {
  private static KInit: Uint8Array = new Uint8Array(0x200);
  private K: Uint8Array;
  private K1: Uint8Array = new Uint8Array(0x200);
  private K2: Uint8Array = new Uint8Array(0x200);
  private decryptCounter: number = 0;
  private encryptCounter: number = 0;

  public add: (x: number, n: number) => number;

  constructor() {
    this.add = this.defaultIncrement;
    TQCipher.initializeStatic();
    this.K1.set(TQCipher.KInit);
    this.K2.set(TQCipher.KInit);
    this.K = this.K1;
  }

  private static initializeStatic() {
    const seed = new Uint8Array([
      0x9d, 0x0f, 0xfa, 0x13, 0x62, 0x79, 0x5c, 0x6d,
    ]);
    for (let i = 0; i < 0x100; i++) {
      TQCipher.KInit[i] = seed[0];
      TQCipher.KInit[i + 0x100] = seed[4];
      seed[0] = (seed[1] + seed[0] * seed[2]) * seed[0] + seed[3];
      seed[4] = (seed[5] - seed[4] * seed[6]) * seed[4] + seed[7];
    }
  }

  public generateKeys(seeds: any[]): void {
    const seed = seeds[0] as number | null;
    if (seed === null) return;

    const a = (seed >> 32) >>> 0;
    const b = seed >>> 0;
    const c = (a + b) ^ 0x4321 ^ a;
    const d = (c * c) >>> 0;

    const temp1 = new Uint8Array(new Uint32Array([c]).buffer);
    const temp2 = new Uint8Array(new Uint32Array([d]).buffer);
    for (let i = 0; i < 0x100; i++) {
      this.K2[i] = this.K1[i] ^ temp1[i % 4];
      this.K2[i + 0x100] = this.K1[i + 0x100] ^ temp2[i % 4];
    }

    this.K = this.K2;
    this.encryptCounter = 0;
  }

  public decrypt(src: Uint8Array, dst: Uint8Array): void {
    this.xor(src, dst, this.K, () => this.add(this.decryptCounter, src.length));
  }

  public encrypt(src: Uint8Array, dst: Uint8Array): void {
    this.xor(src, dst, this.K1, () =>
      this.add(this.encryptCounter, src.length)
    );
  }

  private xor(
    src: Uint8Array,
    dst: Uint8Array,
    k: Uint8Array,
    counter: () => number
  ): void {
    let x = counter();
    for (let i = 0; i < src.length; i++) {
      dst[i] = src[i] ^ 0xab;
      dst[i] = (dst[i] >> 4) | (dst[i] << 4);
      dst[i] ^= k[x & 0xff];
      dst[i] ^= k[(x >> 8) + 0x100];
      x++;
    }
  }

  private defaultIncrement(x: number, n: number): number {
    const prev = x;
    x = (x + n) & 0xffff;
    return prev;
  }
}
