import { constants, Queues } from '../../config/constants';
import { startRabbitMQConsumer } from '../../Network/RabbitMQ/rabbitMQConsumer';
import { getRabbitMQClient } from '../../Utils/RabbitMQClient';
import { processAccountProcessingMessage } from './processMessage';

export const loginResponseQueueClient = getRabbitMQClient(
  constants.rabbitMqUrl,
  Queues.LoginResponse
);

export const startAccountProcessingServer = () => {
  loginResponseQueueClient.connect().catch((error) => {
    console.error('Failed to connect to RabbitMQ:', error);
    process.exit(1); // Exit the process if RabbitMQ connection fails
  });

  startRabbitMQConsumer(Queues.Login, processAccountProcessingMessage);
};
