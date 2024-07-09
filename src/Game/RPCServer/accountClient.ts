import * as grpc from '@grpc/grpc-js';
import { AccountServiceClient } from '../../Account/RPCServer/generated/account_grpc_pb';

// TODO: move localhost to env variable
export const gameRPCClient = new AccountServiceClient(
  'localhost:50052',
  grpc.credentials.createInsecure()
);
