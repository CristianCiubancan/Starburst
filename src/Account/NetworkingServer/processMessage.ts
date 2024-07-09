import { IProcessProps } from '../../Network/Packets/IMsgBase';
import { TQCipher } from '../../Network/Security/TQCipher';
import { accountTcpServer } from './server';

export async function processAccountNetworkingMessage(props: IProcessProps) {
  const { packet, connectionIdentifier } = props;

  const connection = accountTcpServer.getConnection(connectionIdentifier);

  if (!connection) {
    accountTcpServer.removeConnectionFromMap(connectionIdentifier);
    return;
  }

  accountTcpServer.sendAsync(packet, new TQCipher(), connection, '');
}
