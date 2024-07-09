import { constants, Queues } from '../../config/constants';
import { getRabbitMQClient } from '../../Utils/RabbitMQClient';
import { startRabbitMQConsumer } from '../../Network/RabbitMQ/rabbitMQConsumer';
import { IProcessProps } from '../../Network/Packets/IMsgBase';
import { TQCipher } from '../../Network/Security/TQCipher';
import {
  Connection,
  ServerConfig,
  TcpServer,
} from '../../Network/Sockets/TcpServer';
import { processAccountNetworkingMessage } from './processMessage';

export const config: ServerConfig = {
  maxConnections: 1000,
  bufferSize: 4096,
  delay: false,
  exchange: false,
  footerLength: 0,
};
export const loginQueueClient = getRabbitMQClient(
  constants.rabbitMqUrl,
  Queues.Login
);

export const accountTcpServer = TcpServer.getInstance(config);

export const startAccountNetworkingServer = () => {
  console.log(
    `Account Client Server started on port ${constants.accountServerPort}`
  );

  loginQueueClient.connect().catch((error) => {
    console.error('Failed to connect to RabbitMQ:', error);
    process.exit(1); // Exit the process if RabbitMQ connection fails
  });

  // Event listeners for server events
  accountTcpServer.on('connection', (conn: Connection) => {
    conn.id =
      conn.socket.remoteAddress +
      ':' +
      conn.socket.remotePort +
      ' - ' +
      new Date().toISOString();

    accountTcpServer.addConnectionToMap(conn.id, conn);

    conn.on('data', async (data: Buffer) => {
      try {
        const cipher = new TQCipher();
        let newData: IProcessProps;
        let buffer: Uint8Array = new Uint8Array(data.length);
        cipher.decrypt(data, buffer);
        await accountTcpServer.splitting(
          Buffer.from(buffer),
          buffer.length,
          0,
          0,
          []
        );

        newData = {
          user: null,
          packet: Buffer.from(buffer),
          connectionIdentifier: conn.id,
          ipAddress: conn.socket.remoteAddress || '',
        };

        await loginQueueClient.sendToQueue(newData);
      } catch (e) {
        console.error('Failed to process data:', e);
      }
    });

    conn.on('close', () => {
      accountTcpServer.removeConnectionFromMap(conn.id);
    });
  });

  accountTcpServer.start(constants.accountServerPort);

  startRabbitMQConsumer(Queues.LoginResponse, processAccountNetworkingMessage);
};
