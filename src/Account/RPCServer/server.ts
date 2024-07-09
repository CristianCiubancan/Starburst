import * as grpc from '@grpc/grpc-js';
import {
  AccountServiceService,
  IAccountServiceServer,
} from './generated/account_grpc_pb';
import { Message, Response } from './generated/account_pb';

export const startAccountGRPCServer = () => {
  const server = new grpc.Server();

  const communicatorServer: IAccountServiceServer = {
    sendMessage: (call, callback) => {
      console.log(`Received message: ${call.request.getText()}`);
      const reply = new Response();
      reply.setResult('Hello from Server');
      callback(null, reply);
    },
  };

  server.addService(AccountServiceService, communicatorServer);

  const port = '0.0.0.0:50051';
  server.bindAsync(
    port,
    grpc.ServerCredentials.createInsecure(),
    (err, bindPort) => {
      if (err) {
        console.error(`Server error: ${err.message}`);
        return;
      }
      console.log(`Account gRPC Server running at http://${port}`);
    }
  );
};
