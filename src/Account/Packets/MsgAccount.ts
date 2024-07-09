import { sql } from 'drizzle-orm';
import { db } from '../../Database/drizzleClient';
import { DbAccount } from '../../Database/schema';
import { IMsgBase, IProcessProps } from '../../Network/Packets/IMsgBase';
import { PacketReader } from '../../Network/Packets/PacketReader';
import { PacketWriter } from '../../Network/Packets/PacketWriter';
import { RC5 } from '../../Network/Security/RC5';
import { MsgConnectEx, RejectionCodes } from './MsgConnectEx';
import { loginResponseQueueClient } from '../ProcessingServer/server';
import { TransferAuthArgProcedure } from '../RPCServer/gameProcedures';
import { constants } from '../../config/constants';

export interface ITransferAuthArgs {
  ipAddress: string;
  accountId: number;
  authorityId: number;
  authorityName: string;
}

class MsgAccount implements IMsgBase {
  length = 0;
  type = 0;

  username: string = '';
  password: string = '';
  realm: string = '';

  decode(buffer: Buffer): void {
    const reader = new PacketReader(buffer);
    this.length = reader.readUInt16();
    this.type = reader.readUInt16();
    this.username = reader.readString(16);
    this.password = this.decryptPassword(reader.readBytes(16));
    this.realm = reader.readString(16);
  }

  private decryptPassword(buffer: Buffer): string {
    const rc5 = new RC5();
    const password = Buffer.alloc(16);
    rc5.decrypt(buffer, password);
    return password.toString('ascii').replace(/\0/g, '');
  }

  encode(): Buffer {
    const writer = new PacketWriter();
    writer.writeUInt16(this.length);
    writer.writeUInt16(this.type);
    writer.writeString(this.username, 16);
    writer.writeBytes(this.encryptPassword(this.password));
    writer.writeString(this.realm, 16);
    return writer.toBuffer();
  }

  private encryptPassword(password: string): Buffer {
    const rc5 = new RC5();
    const passwordBuffer = Buffer.alloc(16);
    passwordBuffer.write(password, 'ascii');
    const encryptedPassword = Buffer.alloc(16);
    rc5.encrypt(passwordBuffer, encryptedPassword);
    return encryptedPassword;
  }

  async process(props: IProcessProps): Promise<void> {
    //  select the accounts where the username matches
    const accounts = await db
      .select()
      .from(DbAccount)
      .where(sql`username = ${this.username}`)
      .limit(1)
      .execute();

    // TODO: get the token from the game server transfer auth
    if (!accounts?.length) {
      const msg = new MsgConnectEx(RejectionCodes.InvalidPassword).encode();

      loginResponseQueueClient.sendToQueue({
        user: null,
        packet: msg,
        connectionIdentifier: props.connectionIdentifier,
        ipAddress: props.ipAddress,
      });
      return;
    }
    const account = accounts[0];

    const transferAuthArgs: ITransferAuthArgs = {
      ipAddress: props.ipAddress,
      accountId: account.accountID,
      authorityId: account.authorityID || 5,
      authorityName: account.name || '',
    };

    const token = await TransferAuthArgProcedure(transferAuthArgs);

    const msg = new MsgConnectEx(
      RejectionCodes.Clear,
      BigInt(token as string),
      // BigInt(6385335909927458816),
      constants.gamneServerHost,
      constants.gameServerPort
    ).encode();

    loginResponseQueueClient.sendToQueue({
      user: null,
      packet: msg,
      connectionIdentifier: props.connectionIdentifier,
      ipAddress: props.ipAddress,
    });
  }
}

export { MsgAccount };
