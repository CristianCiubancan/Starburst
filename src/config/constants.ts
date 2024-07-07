export const constants = {
  rabbitMqUrl: process.env.RABBIT_MQ_URL || 'amqp://localhost',
  accountServerHost: process.env.ACCOUNT_SERVER_HOST || 'localhost',
  accountServerPort: process.env.ACCOUNT_SERVER_PORT
    ? parseInt(process.env.ACCOUNT_SERVER_PORT, 10)
    : 9959,
};

export enum Queues {
  Login = 'LoginQueue',
  LoginResponse = 'LoginResponseQueue',
}
