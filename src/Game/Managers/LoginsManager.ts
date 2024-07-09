import { ITransferAuthArgs } from '../../Account/Packets/MsgAccount';
import crypto from 'crypto';

export class LoginsManager {
  private logins: Map<string, ITransferAuthArgs> = new Map();
  static instance: LoginsManager;

  constructor() {
    if (LoginsManager.instance) {
      return LoginsManager.instance;
    }

    this.logins = new Map(); // Using Map to store tokens and account data
    LoginsManager.instance = this;
  }

  /**
   * Retrieves the singleton instance of the LoginsManager.
   * @returns {LoginsManager} - The LoginsManager instance.
   * @static
   * @memberof LoginsManager
   */
  static getInstance() {
    return LoginsManager.instance || new LoginsManager();
  }

  /**
   * Generates a unique token.
   * @returns {string} - The unique token.
   */
  generateToken() {
    const bytes = crypto.randomBytes(8); // 8 bytes = 64 bits
    const token = bytes.readBigUInt64LE(); // Read as 64-bit unsigned integer (little-endian)
    return token;
  }

  /**
   * Adds an account to the map with a specific TTL.
   * @param {string} token - The unique token for the account.
   * @param {object} accountData - The account data to store.
   * @param {number} ttl - Time-to-live in seconds.
   */
  addAccount(token: string, accountData: ITransferAuthArgs) {
    this.logins.set(token, accountData);
  }

  /**
   * Retrieves an account from the map by its token.
   * @param {string} token - The unique token for the account.
   * @returns {object|null} - The account data or null if not found.
   */
  getAccount(token: string) {
    return this.logins.get(token);
  }

  /**
   * Removes an account from the map by its token.
   * @param {string} token - The unique token for the account.
   */
  removeAccount(token: string) {
    this.logins.delete(token);
  }
}
