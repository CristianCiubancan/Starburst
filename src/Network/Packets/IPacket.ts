export type IPacket = {
  decode(buffer: Buffer): void;
  encode(): Buffer;
};
