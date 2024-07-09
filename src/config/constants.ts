export const constants = {
  rabbitMqUrl: process.env.RABBIT_MQ_URL || 'amqp://localhost',
  accountServerHost: process.env.ACCOUNT_SERVER_HOST || '192.168.1.107',
  accountServerPort: process.env.ACCOUNT_SERVER_PORT
    ? parseInt(process.env.ACCOUNT_SERVER_PORT, 10)
    : 9959,
  gamneServerHost: process.env.GAME_SERVER_HOST || '192.168.1.107',
  gameServerPort: process.env.GAME_SERVER_PORT
    ? parseInt(process.env.GAME_SERVER_PORT, 10)
    : 5818,
};

export enum Queues {
  Login = 'LoginQueue',
  LoginResponse = 'LoginResponseQueue',
  Game = 'GameQueue',
  GameResponse = 'GameResponseQueue',
}
