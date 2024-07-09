import { DbAccount } from '../../Database/schema';
import { Connection } from '../Sockets/TcpServer';

export interface IMsgBase {
  length: number;
  type: number;
  decode(buffer: Buffer): void;
  encode(): Buffer;
  process(data?: any): void;
}

export interface IProcessProps {
  user: typeof DbAccount.$inferSelect | null;
  packet: Buffer;
  connectionIdentifier: string;
  ipAddress: string;
}
