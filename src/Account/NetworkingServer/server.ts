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

const server = TcpServer.getInstance(config);

export const loginQueueClient = getRabbitMQClient(
  constants.rabbitMqUrl,
  Queues.Login
);

loginQueueClient.connect().catch((error) => {
  console.error('Failed to connect to RabbitMQ:', error);
  process.exit(1); // Exit the process if RabbitMQ connection fails
});

// Event listeners for server events
server.on('connection', (conn: Connection) => {
  conn.id =
    conn.socket.remoteAddress +
    ':' +
    conn.socket.remotePort +
    ' - ' +
    new Date().toISOString();

  server.addConnectionToMap(conn.id, conn);

  conn.on('data', async (data: Buffer) => {
    try {
      const cipher = new TQCipher();
      let newData: IProcessProps;
      let buffer: Uint8Array = new Uint8Array(data.length);
      cipher.decrypt(data, buffer);
      await server.splitting(buffer, buffer.length, 0, { consumed: 0 }, []);

      newData = {
        user: null,
        packet: Buffer.from(buffer),
        connectionIdentifier: conn.id,
      };

      await loginQueueClient.sendToQueue(newData);
    } catch (e) {
      console.error('Failed to process data:', e);
    }
  });

  conn.on('close', () => {
    server.removeConnectionFromMap(conn.id);
  });
});

server.start(constants.accountServerPort);

startRabbitMQConsumer(Queues.LoginResponse, processAccountNetworkingMessage);
