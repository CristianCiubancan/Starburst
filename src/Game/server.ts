import { LoginsManager } from './Managers/LoginsManager';
import { startGameNetworkingServer } from './NetworkingServer/server';
import { startGameGRPCServer } from './RPCServer/server';

const loginsManager = LoginsManager.getInstance();

startGameNetworkingServer();
startGameGRPCServer(loginsManager);
