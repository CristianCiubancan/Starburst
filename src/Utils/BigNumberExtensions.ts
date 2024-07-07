import BigNumber from 'bignumber.js';

// Extend BigNumber prototype to include isProbablePrime
(BigNumber as any).prototype.isProbablePrime = function (
  iterations: number = 5
): boolean {
  const n = this as BigNumber;
  if (n.lt(2)) return false;
  if (n.eq(2) || n.eq(3)) return true;
  if (n.mod(2).eq(0) || n.mod(3).eq(0)) return false;

  let i = new BigNumber(5);
  while (i.pow(2).lte(n)) {
    if (n.mod(i).eq(0) || n.mod(i.plus(2)).eq(0)) return false;
    i = i.plus(6);
  }
  return true;
};

// Extend the BigNumber interface to include the new method
declare module 'bignumber.js' {
  interface BigNumber {
    isProbablePrime(iterations?: number): boolean;
  }
}
