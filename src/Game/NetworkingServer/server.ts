import { constants, Queues } from '../../config/constants';
import { getRabbitMQClient } from '../../Utils/RabbitMQClient';
import { startRabbitMQConsumer } from '../../Network/RabbitMQ/rabbitMQConsumer';
import {
  Connection,
  ServerConfig,
  TcpServer,
} from '../../Network/Sockets/TcpServer';
import { processGameNetworkingMessage } from './processMessage';
import { logger } from '../../Services/LoggingService';
import { DiffieHellman } from '../../Network/Security/DiffieHellman';
import { MsgHandshake } from '../Packets/MsgHandshake';
import { BlowfishCipher } from '../../Network/Security/BlowfishCipher';
import { PacketTypes } from '../../Network/Packets/PacketTypes';
import { Client } from './Networking/Client';

export const config: ServerConfig = {
  maxConnections: 1000,
  bufferSize: 4096,
  delay: false,
  exchange: false,
  footerLength: 0,
};

// TODO: split into multiple queues, ideally one per map inside of the game.
// Note: we would check how many theards we have empty, then go through each
// queue taking one message and going to the next queue. And spawning a new
// thread to handle a new message, every time we have an empty thread.
// At the same time we would not take more than one message from the same queue
// at the same time. This way we would have a fair distribution of messages
// between the queues. And no risk of race conditions.
export const loginQueueClient = getRabbitMQClient(
  constants.rabbitMqUrl,
  Queues.Game
);

export const startGameNetworkingServer = () => {
  const server = TcpServer.getInstance(config);

  console.log(`Game Client Server started on port ${constants.gameServerPort}`);

  loginQueueClient.connect().catch((error) => {
    console.error('Failed to connect to RabbitMQ:', error);
    process.exit(1); // Exit the process if RabbitMQ connection fails
  });

  // Event listeners for server events
  server.on('connection', async (conn: Connection) => {
    const client = new Client(conn);
    const footer = 'TQServer';

    client.diffieHellman.generateKeys();
    client.diffieHellman.randomizeIVs();

    const handshakeMessage = new MsgHandshake(
      client.diffieHellman,
      client.diffieHellman.encryptionIV,
      client.diffieHellman.decryptionIV
    );

    await handshakeMessage.randomizeAsync();

    const data = handshakeMessage.encode();

    server.sendAsync(data, client.cipher, conn, footer);

    conn.remaining = 0;

    conn.once('data', async (data: Buffer) => {
      client.buffer = Buffer.concat([client.buffer, data]);
      let consumed = 0;
      let examined: number = data.length;
      let remaining = 0;

      client.cipher.decrypt(data.subarray(0, 9), data.subarray(0, 9));
      const exchangeLength = data.readUInt16LE(7) + 7;

      if (data.length < exchangeLength) {
        conn.socket.end();
      }

      client.cipher.decrypt(
        client.buffer.subarray(9, consumed),
        client.buffer.subarray(9, consumed)
      );

      if (consumed < examined) {
        client.cipher.decrypt(
          client.buffer.subarray(consumed, examined),
          client.buffer.subarray(consumed, examined)
        );

        let packets: Buffer[] = [];
        server.splitting(
          client.buffer,
          examined,
          footer.length,
          consumed,
          packets
        );

        remaining = examined - consumed;
        client.buffer.copyWithin(0, consumed, examined); // Update the buffer to contain the remaining data
      }
    });

    conn.on('data', async (data: Buffer) => {
      let examined = data.length;
      let consumed = 0;

      client.cipher.decrypt(
        client.buffer.subarray(conn.remaining, examined),
        client.buffer.subarray(conn.remaining, examined)
      );

      let packets: Buffer[] = [];
      server.splitting(
        client.buffer,
        examined + (conn.remaining || 0),
        footer.length,
        consumed,
        packets
      );
      client.buffer.copyWithin(0, consumed, examined);

      const lenth = client.buffer.readUInt16LE(0);
      const type = client.buffer.readUInt16LE(2);

      console.log('Length:', lenth);
      console.log('Type:', type);
      // server.sendAsync(data, client.cipher, conn, footer);
    });
  });

  server.start(constants.gameServerPort);

  startRabbitMQConsumer(Queues.GameResponse, processGameNetworkingMessage);
};
