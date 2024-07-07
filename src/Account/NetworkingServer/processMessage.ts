import { IProcessProps } from '../../Network/Packets/IMsgBase';
import { PacketTypes } from '../../Network/Packets/PacketTypes';
import { TcpServer } from '../../Network/Sockets/TcpServer';
import { MsgAccount } from '../Packets/MsgAccount';
import { MsgConnectEx } from '../Packets/MsgConnectEx';
import { config } from './server';

export async function processAccountNetworkingMessage(props: IProcessProps) {
  const tcpServer = TcpServer.getInstance(config);

  const { packet, connectionIdentifier } = props;

  const connection = tcpServer.getConnection(connectionIdentifier);

  if (!connection) {
    throw new Error('Connection not found');
  }

  tcpServer.sendAsync(packet, connection, Buffer.alloc(0));
}
