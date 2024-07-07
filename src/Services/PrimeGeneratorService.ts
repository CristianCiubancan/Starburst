import BigNumber from 'bignumber.js';
import { randomBytes } from 'crypto';

export class PrimeGeneratorService {
  private bitLength: number;
  private bufferChannel: AsyncIterable<BigNumber>;
  private generator: () => Buffer;

  constructor(capacity: number = 100, bitLength: number = 256) {
    this.bitLength = bitLength;
    this.generator = () => randomBytes(this.bitLength / 8);
    this.bufferChannel = this.createBufferChannel(capacity);
  }

  private async *createBufferChannel(
    capacity: number
  ): AsyncIterable<BigNumber> {
    const buffer: BigNumber[] = [];
    const generatePrime = (): BigNumber => {
      let prime: BigNumber;
      do {
        prime = new BigNumber(this.generator().toString('hex'), 16);
      } while (!prime.isProbablePrime());
      return prime;
    };

    while (true) {
      if (buffer.length < capacity) {
        buffer.push(generatePrime());
      }
      yield buffer.shift()!;
    }
  }

  public async nextAsync(): Promise<BigNumber> {
    for await (const prime of this.bufferChannel) {
      return prime;
    }
    throw new Error('Failed to generate prime');
  }
}
