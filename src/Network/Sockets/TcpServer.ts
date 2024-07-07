import net from 'net';
import { EventEmitter } from 'events';
import { TQCipher } from '../Security/TQCipher';
import { logger } from '../../Services/LoggingService';

export interface ServerConfig {
  maxConnections: number;
  bufferSize: number;
  delay: boolean;
  exchange: boolean;
  footerLength: number;
}

export interface Connection {
  id: string;
  socket: net.Socket;
  on: (event: string, listener: (...args: any[]) => void) => void;
  buffer: Buffer;
}

export const PacketFooter = Buffer.alloc(0);

export class TcpServer {
  public static instance: TcpServer;
  public server: net.Server;
  public eventEmitter: EventEmitter;
  public connections: Map<string, Connection>;
  public bufferPool: Buffer[];
  public config: ServerConfig;

  private constructor(config: ServerConfig) {
    this.config = config;
    this.server = new net.Server();
    this.eventEmitter = new EventEmitter();
    this.connections = new Map<string, Connection>();

    this.bufferPool = Array.from({ length: config.maxConnections }, () =>
      Buffer.alloc(config.bufferSize)
    );

    this.server.on('connection', this.handleConnection.bind(this));
  }

  public static getInstance(config: ServerConfig): TcpServer {
    if (!TcpServer.instance) {
      TcpServer.instance = new TcpServer(config);
    }
    return TcpServer.instance;
  }

  public start(port: number, host: string = '0.0.0.0'): void {
    this.server.listen(port, host, () => {
      console.log(`Server listening on ${host}:${port}`);
    });
  }

  public on(event: string, listener: (...args: any[]) => void): void {
    this.eventEmitter.on(event, listener);
  }

  public off(event: string, listener: (...args: any[]) => void): void {
    this.eventEmitter.off(event, listener);
  }

  public getConnections(): number {
    return this.connections.size;
  }

  public async sendAsync(
    packet: Buffer,
    connection: Connection,
    packetFooter: Buffer
  ): Promise<void> {
    const encrypted = Buffer.alloc(packet.length + packetFooter.length);
    packet.copy(encrypted, 0);

    const cipher = new TQCipher();

    encrypted.writeUInt16LE(packet.length, 0);
    packetFooter.copy(encrypted, packet.length);

    return new Promise<void>((resolve, reject) => {
      cipher.encrypt(encrypted, encrypted);
      try {
        connection.socket.write(encrypted, (err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      } catch (e) {
        reject(e);
      }
    });
  }

  public async splitting(
    buffer: Uint8Array,
    examined: number,
    footerLength: number,
    consumedRef: { consumed: number },
    packetsRef: Uint8Array[]
  ): Promise<boolean> {
    const dataView = new DataView(buffer.buffer);
    let consumed = consumedRef.consumed;

    while (consumed + 2 < examined) {
      const length = dataView.getUint16(consumed, true); // Assuming little-endian
      if (length === 0) return false;
      const expected = consumed + length + footerLength;
      if (length > buffer.length) return false;
      if (expected > examined) break;

      packetsRef.push(buffer.slice(consumed, consumed + length + footerLength));
      consumed += length + footerLength;
    }

    consumedRef.consumed = consumed;
    return true;
  }

  private handleConnection(socket: net.Socket): void {
    if (this.connections.size >= this.config.maxConnections) {
      socket.end();
      return;
    }

    const buffer = this.bufferPool.pop();
    if (!buffer) {
      socket.end();
      return;
    }

    const connection: Connection = {
      socket,
      buffer,
      on: socket.on.bind(socket),
      id: socket.remoteAddress + ':' + socket.remotePort,
    };
    this.connections.set(connection.id, connection);

    socket.on('data', (data) => this.handleData(connection, data));
    socket.on('close', () => this.handleDisconnect(connection));

    this.eventEmitter.emit('connection', connection);
  }

  private handleData(connection: Connection, data: Buffer): void {
    this.eventEmitter.emit('data', connection, data);
  }

  private handleDisconnect(connection: Connection): void {
    this.connections.delete(connection.id);
    this.bufferPool.push(connection.buffer);
    this.eventEmitter.emit('disconnect', connection);
  }

  public addConnectionToMap(id: string, connection: Connection): void {
    this.connections.set(id, connection);
  }

  public removeConnectionFromMap(id: string): void {
    this.connections.delete(id);
  }

  public getConnection(id: string): Connection | undefined {
    return this.connections.get(id);
  }
}
