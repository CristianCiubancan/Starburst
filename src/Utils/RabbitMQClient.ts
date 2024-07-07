import { connect, Channel, Connection } from 'amqplib';
import { constants, Queues } from '../config/constants';
import { IProcessProps } from '../Network/Packets/IMsgBase';

export class RabbitMQClient {
  private connection: Connection | null = null;
  private channel: Channel | null = null;
  private isConnected: boolean = false;
  private queueName: string;

  constructor(private url: string, queueName: string) {
    this.queueName = queueName;
  }

  async connect(): Promise<void> {
    try {
      this.connection = await connect(this.url);
      this.channel = await this.connection.createChannel();
      await this.channel.assertQueue(this.queueName);
      this.isConnected = true;
      console.log(`Connected to RabbitMQ at ${this.url}`);
    } catch (error) {
      console.error('Failed to connect to RabbitMQ:', error);
      throw error;
    }
  }

  async sendToQueue(data: IProcessProps): Promise<void> {
    if (!this.isConnected || !this.channel) {
      throw new Error('RabbitMQ client is not connected.');
    }

    // turn data into a buffer
    const buffer = Buffer.from(JSON.stringify(data));

    try {
      await this.channel.sendToQueue(this.queueName, buffer);
      console.log('Message sent to RabbitMQ queue:', this.queueName);
    } catch (error) {
      console.error('Failed to send message to RabbitMQ:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.channel) {
      await this.channel.close();
      this.channel = null;
    }

    if (this.connection) {
      await this.connection.close();
      this.connection = null;
      this.isConnected = false;
      console.log('Disconnected from RabbitMQ.');
    }
  }
}

export const getRabbitMQClient = (url: string, queueName: string) => {
  return new RabbitMQClient(url, queueName);
};
