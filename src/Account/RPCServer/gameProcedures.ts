import { TransferAuthArgs } from '../../Game/RPCServer/generated/game_pb';
import { ITransferAuthArgs } from '../Packets/MsgAccount';
import { gameRPCClient } from './gameClient';

export const TransferAuthArgProcedure = async ({
  accountId,
  ipAddress,
  authorityId,
  authorityName,
}: ITransferAuthArgs) => {
  const request = new TransferAuthArgs();
  request.setAccountid(accountId);
  request.setIpaddress(ipAddress);
  request.setAuthorityid(authorityId);
  request.setAuthorityname(authorityName);

  return new Promise((resolve, reject) => {
    gameRPCClient.transferAuthArgsProcedure(request, (error, response) => {
      if (error) {
        return reject(error);
      }
      resolve(response.getToken());
    });
  });
};
