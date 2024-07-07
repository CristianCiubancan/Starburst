import EventEmitter from 'events';
import { Connection } from '../Network/Sockets/TcpServer';

const SendMessage = (socket: Connection, msg: Buffer) => {
  const eventEmitter = new EventEmitter();
  eventEmitter.emit('data', socket, msg);
};

export default SendMessage;
