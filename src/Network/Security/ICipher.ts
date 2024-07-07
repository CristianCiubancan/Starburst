export interface ICipher {
  /**
   * Generates keys using key derivation variables.
   * @param seeds Initialized seeds for generating keys
   */
  generateKeys(seeds: any[]): void;

  /**
   * Decrypts data from the client
   * @param src Source buffer that requires decrypting
   * @param dst Destination buffer to contain the decrypted result
   */
  decrypt(src: Buffer, dst: Buffer): void;

  /**
   * Encrypts data to send to the client
   * @param src Source buffer that requires encrypting
   * @param dst Destination buffer to contain the encrypted result
   */
  encrypt(src: Buffer, dst: Buffer): void;
}
