import {
  createDiffieHellman,
  DiffieHellman as CryptoDiffieHellman,
} from 'crypto';

// Utility functions for encoding/decoding hex strings
export function encodeHex(buffer: Uint8Array): string {
  return Buffer.from(buffer).toString('hex');
}

export function decodeHex(hex: string): Uint8Array {
  return Uint8Array.from(Buffer.from(hex, 'hex'));
}

export class DiffieHellman {
  private static readonly DefaultGenerator = '05';
  private static readonly DefaultPrimativeRoot =
    'E7A69EBDF105F2A6BBDEAD7E798F76A209AD73FB466431E2E7352ED262F8C558' +
    'F10BEFEA977DE9E21DCEE9B04D245F300ECCBBA03E72630556D011023F9E857F';

  private dh: CryptoDiffieHellman;

  public primeRoot: string;
  public generator: string;
  public publicKey?: string;
  public privateKey?: string;

  public decryptionIV: Uint8Array;
  public encryptionIV: Uint8Array;

  constructor(
    p: string = DiffieHellman.DefaultPrimativeRoot,
    g: string = DiffieHellman.DefaultGenerator
  ) {
    this.primeRoot = p;
    this.generator = g;
    this.dh = createDiffieHellman(this.primeRoot, 'hex', this.generator, 'hex');
    this.decryptionIV = new Uint8Array(8);
    this.encryptionIV = new Uint8Array(8);
  }

  public generateKeys(): void {
    this.dh.generateKeys();
    this.publicKey = this.dh.getPublicKey('hex');
    this.privateKey = this.dh.getPrivateKey('hex');
  }

  public randomizeIVs(): void {
    this.decryptionIV = new Uint8Array(8);
    this.encryptionIV = new Uint8Array(8);

    for (let i = 0; i < 8; i++) {
      this.decryptionIV[i] = Math.floor(Math.random() * 256);
      this.encryptionIV[i] = Math.floor(Math.random() * 256);
    }
  }

  public computeSecret(clientKeyString: string): string {
    const clientPublicKey = Buffer.from(clientKeyString, 'hex');
    const secret = this.dh.computeSecret(clientPublicKey);
    return encodeHex(secret);
  }
}
