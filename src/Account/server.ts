import { startAccountNetworkingServer } from './NetworkingServer/server';
import { startAccountProcessingServer } from './ProcessingServer/server';
import { startAccountGRPCServer } from './RPCServer/server';

startAccountNetworkingServer();
startAccountProcessingServer();
startAccountGRPCServer();
