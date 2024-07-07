import { MsgAccount } from '../Packets/MsgAccount';
import { MsgConnectEx } from '../Packets/MsgConnectEx';
import { IProcessProps } from '../../Network/Packets/IMsgBase';
import { PacketTypes } from '../../Network/Packets/PacketTypes';

export async function processAccountProcessingMessage(props: IProcessProps) {
  const { packet } = props;
  // Validate connection or other checks
  // For simplicity, assuming 'actor' is an object with necessary properties
  // Read TQ's binary header
  const length = packet.readUInt16LE(0); // Assuming little-endian format
  const type = packet.readUInt16LE(2) as PacketTypes; // Assuming little-endian format
  try {
    // Switch on the packet type
    let msg: any = null;
    switch (type) {
      case PacketTypes.MsgAccount: // Example for MsgAccount packet type (adjust as per your actual types)
        msg = new MsgAccount(); // Instantiate your message class
        break;
      case PacketTypes.MsgConnectEx: // Example for MsgConnectEx packet type (adjust as per your actual types)
        msg = new MsgConnectEx(); // Instantiate your message class
        break;
      default:
        console.warn(`Missing packet ${type}, Length ${length}`);
        return;
    }
    if (msg === null) return;
    // Decode packet bytes into the structure and process
    msg.decode(packet); // Implement your decoding method
    await msg.process(props); // Implement your async processing method
  } catch (e) {
    console.error('Error processing message:', e);
  }
}
