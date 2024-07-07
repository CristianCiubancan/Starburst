import BigNumber from 'bignumber.js';
import { PrimeGeneratorService } from '../../Services/PrimeGeneratorService';

class DiffieHellman {
  public static readonly ProbablePrimes = new PrimeGeneratorService();
  private static readonly DefaultGenerator = '05';
  private static readonly DefaultPrimativeRoot =
    'E7A69EBDF105F2A6BBDEAD7E798F76A209AD73FB466431E2E7352ED262F8C558' +
    'F10BEFEA977DE9E21DCEE9B04D245F300ECCBBA03E72630556D011023F9E857F';

  public primeRoot: BigNumber;
  public generator: BigNumber;
  public modulus?: BigNumber;
  public publicKey?: BigNumber;
  public privateKey?: BigNumber;

  public decryptionIV: Uint8Array;
  public encryptionIV: Uint8Array;

  constructor(
    p: string = DiffieHellman.DefaultPrimativeRoot,
    g: string = DiffieHellman.DefaultGenerator
  ) {
    this.primeRoot = new BigNumber(p, 16);
    this.generator = new BigNumber(g, 16);
    this.decryptionIV = new Uint8Array(8);
    this.encryptionIV = new Uint8Array(8);
  }

  public async computePublicKeyAsync(): Promise<void> {
    if (!this.modulus) {
      this.modulus = await DiffieHellman.ProbablePrimes.nextAsync();
    }
    this.publicKey = this.generator
      .exponentiatedBy(this.modulus)
      .mod(this.primeRoot);
  }

  public computePrivateKey(clientKeyString: string): void {
    const clientKey = new BigNumber(clientKeyString, 16);
    if (this.modulus) {
      this.privateKey = clientKey
        .exponentiatedBy(this.modulus)
        .mod(this.primeRoot);
    } else {
      throw new Error(
        'Modulus is not defined. Ensure computePublicKeyAsync is called first.'
      );
    }
  }
}

// Utility functions for encoding/decoding hex strings
export function encodeHex(buffer: Uint8Array): string {
  return Buffer.from(buffer).toString('hex');
}

export function decodeHex(hex: string): Uint8Array {
  return Uint8Array.from(Buffer.from(hex, 'hex'));
}
