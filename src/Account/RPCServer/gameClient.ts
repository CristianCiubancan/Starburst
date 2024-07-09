import * as grpc from '@grpc/grpc-js';
import { GameServiceClient } from '../../Game/RPCServer/generated/game_grpc_pb';

// TODO: move localhost to env variable
export const gameRPCClient = new GameServiceClient(
  'localhost:50052',
  grpc.credentials.createInsecure()
);
