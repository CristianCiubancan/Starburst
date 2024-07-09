import * as grpc from '@grpc/grpc-js';
import {
  GameServiceService,
  IGameServiceServer,
} from './generated/game_grpc_pb';
import { TransferAuthArgsResponse } from './generated/game_pb';
import { LoginsManager } from '../Managers/LoginsManager';
const crypto = require('crypto');

export const startGameGRPCServer = (loginsManager: LoginsManager) => {
  const server = new grpc.Server();

  const gameServer: IGameServiceServer = {
    transferAuthArgsProcedure: (call, callback) => {
      const token = LoginsManager.getInstance().generateToken();
      const reply = new TransferAuthArgsResponse();
      reply.setToken(token.toString());
      callback(null, reply);
    },
  };

  server.addService(GameServiceService, gameServer);

  const port = '0.0.0.0:50052';
  server.bindAsync(
    port,
    grpc.ServerCredentials.createInsecure(),
    (err, bindPort) => {
      if (err) {
        console.error(`Server error: ${err.message}`);
        return;
      }
      console.log(`Game gRPC Server running at http://${port}`);
    }
  );
};
