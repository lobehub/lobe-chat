import { lambdaClient } from '@/libs/trpc/client';

import { IAiProviderService } from './type';

export class ServerService implements IAiProviderService {
  createAiProvider: IAiProviderService['createAiProvider'] = async (params) => {
    return lambdaClient.aiProvider.createAiProvider.mutate(params);
  };

  getAiProviderList: IAiProviderService['getAiProviderList'] = async () => {
    return lambdaClient.aiProvider.getAiProviderList.query();
  };

  getAiProviderById: IAiProviderService['getAiProviderById'] = async (id) => {
    return lambdaClient.aiProvider.getAiProviderById.query({ id });
  };

  toggleProviderEnabled: IAiProviderService['toggleProviderEnabled'] = async (id, enabled) => {
    return lambdaClient.aiProvider.toggleProviderEnabled.mutate({ enabled, id });
  };

  updateAiProvider: IAiProviderService['updateAiProvider'] = async (id, value) => {
    return lambdaClient.aiProvider.updateAiProvider.mutate({ id, value });
  };

  updateAiProviderConfig: IAiProviderService['updateAiProviderConfig'] = async (id, value) => {
    return lambdaClient.aiProvider.updateAiProviderConfig.mutate({ id, value });
  };

  updateAiProviderOrder: IAiProviderService['updateAiProviderOrder'] = async (items) => {
    return lambdaClient.aiProvider.updateAiProviderOrder.mutate({ sortMap: items });
  };

  deleteAiProvider: IAiProviderService['deleteAiProvider'] = async (id) => {
    return lambdaClient.aiProvider.removeAiProvider.mutate({ id });
  };

  getAiProviderRuntimeState: IAiProviderService['getAiProviderRuntimeState'] = async (
    isLogin?: boolean,
  ) => {
    return lambdaClient.aiProvider.getAiProviderRuntimeState.query({ isLogin });
  };
}
