import { constants, Queues } from '../../config/constants';
import { logger } from '../../Services/LoggingService';
import { IProcessProps } from '../Packets/IMsgBase';

const amqp = require('amqplib');

export async function startRabbitMQConsumer(
  queueName: Queues,
  processMessage: (props: IProcessProps) => void
) {
  try {
    const connection = await amqp.connect(constants.rabbitMqUrl); // Connect to RabbitMQ
    const channel = await connection.createChannel(); // Create a channel

    await channel.assertQueue(queueName, { durable: true }); // Ensure the queue exists

    logger.info(
      `[*] Waiting for messages in ${queueName}. To exit press CTRL+C`
    );

    channel.consume(queueName, (msg: any) => {
      const data = JSON.parse(msg.content.toString());
      if (msg !== null) {
        processMessage({
          ...data,
          packet: Buffer.from(data.packet.data),
        }); // Process the message (implement this function
        channel.ack(msg); // Acknowledge the message
      }
    });
  } catch (error) {
    console.error('Error:', error);
  }
}
