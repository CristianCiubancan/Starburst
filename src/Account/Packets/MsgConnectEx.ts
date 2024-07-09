import { IMsgBase } from '../../Network/Packets/IMsgBase';
import { PacketReader } from '../../Network/Packets/PacketReader';
import { PacketTypes } from '../../Network/Packets/PacketTypes';
import { PacketWriter } from '../../Network/Packets/PacketWriter';

export enum RejectionCodes {
  Clear = 0,
  InvalidPassword = 1,
  ServerDown = 10,
  AccountBanned = 12,
  ServerBusy = 20,
  AccountLocked = 22,
  AccountNotActivated = 30,
  AccountActivationFailed = 31,
  ServerTimedOut = 42,
  AccountMaxLoginAttempts = 51,
  ServerLocked = 70,
  ServerOldProtocol = 73,
}

class MsgConnectEx implements IMsgBase {
  type = 0;
  length = 0;

  token: bigint;
  code = RejectionCodes.Clear;
  ipAddress: string | null = null;
  port = 0;

  constructor(
    code: RejectionCodes = RejectionCodes.Clear,
    token: bigint = BigInt(0),
    ipAddress: string | null = null,
    port: number = 0
  ) {
    this.code = code;
    this.token = token;
    this.ipAddress = ipAddress;
    this.port = port;
  }

  encode(): Buffer {
    const stringifiedToken = this.token.toString();
    const writer = new PacketWriter();
    writer.writeUInt16(PacketTypes.MsgConnectEx);

    if (this.code !== RejectionCodes.Clear) {
      writer.writeUInt32(0); // Match C# uint (4 bytes)
      writer.writeUInt32(this.code); // Match C# uint (4 bytes)
    } else {
      writer.writeUInt64(this.token); // Use BigInt for 64-bit integer
      writer.writeString(this.ipAddress || '', 16); // Ensure fixed length of 16 bytes
      writer.writeUInt32(this.port);
      writer.writeUInt16(0);
    }

    return writer.toBuffer();
  }

  decode(buffer: Buffer): void {
    const reader = new PacketReader(buffer);

    const packetType = reader.readUInt16();
    if (packetType !== PacketTypes.MsgConnectEx) {
      throw new Error(`Unexpected packet type: ${packetType}`);
    }

    this.code = reader.readUInt32() as RejectionCodes; // Match C# uint (4 bytes)

    if (this.code !== RejectionCodes.Clear) {
      // Failed login
      reader.readUInt32(); // skip a uint (4 bytes)
      this.code = reader.readUInt32() as RejectionCodes; // Match C# uint (4 bytes)
    } else {
      // Successful login
      this.token = reader.readUInt64(); // Match C# uint (4 bytes)
      this.ipAddress = reader.readString(16);
      this.port = reader.readUInt16();
      reader.readUInt16(); // skip the additional ushort (2 bytes)
    }
  }

  async process(data: any): Promise<void> {}
}

export { MsgConnectEx };
