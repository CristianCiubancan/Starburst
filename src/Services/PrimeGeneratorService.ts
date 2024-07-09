import BigNumber from 'bignumber.js';
import { randomBytes } from 'crypto';
// @ts-ignore
import { create as createMillerRabin } from 'miller-rabin';

const millerRabin = createMillerRabin();

// Function to check if a number is a probable prime using the Miller-Rabin test
async function isProbablePrime(
  n: BigNumber,
  iterations: number = 5
): Promise<boolean> {
  return millerRabin.test(n, iterations);
}

// Function to generate a random BigNumber of a given bit length
function generateRandomBigNumber(bitLength: number): BigNumber {
  return new BigNumber(randomBytes(bitLength / 8).toString('hex'), 16);
}

// Function to generate a probable prime number
export async function generateProbablePrime(
  bitLength: number = 256,
  iterations: number = 5
): Promise<BigNumber> {
  let prime: BigNumber;
  while (true) {
    prime = generateRandomBigNumber(bitLength);
    if (await isProbablePrime(prime, iterations)) {
      return prime;
    }
  }
}
