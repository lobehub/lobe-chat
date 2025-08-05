import { trpcClient } from '@/services/_auth/trpc';

import { IAiProviderService } from './type';

export class ServerService implements IAiProviderService {
  createAiProvider: IAiProviderService['createAiProvider'] = async (params) => {
    return trpcClient.aiProvider.createAiProvider.mutate(params);
  };

  getAiProviderList: IAiProviderService['getAiProviderList'] = async () => {
    return trpcClient.aiProvider.getAiProviderList.query();
  };

  getAiProviderById: IAiProviderService['getAiProviderById'] = async (id) => {
    return trpcClient.aiProvider.getAiProviderById.query({ id });
  };

  toggleProviderEnabled: IAiProviderService['toggleProviderEnabled'] = async (id, enabled) => {
    return trpcClient.aiProvider.toggleProviderEnabled.mutate({ enabled, id });
  };

  updateAiProvider: IAiProviderService['updateAiProvider'] = async (id, value) => {
    return trpcClient.aiProvider.updateAiProvider.mutate({ id, value });
  };

  updateAiProviderConfig: IAiProviderService['updateAiProviderConfig'] = async (id, value) => {
    return trpcClient.aiProvider.updateAiProviderConfig.mutate({ id, value });
  };

  updateAiProviderOrder: IAiProviderService['updateAiProviderOrder'] = async (items) => {
    return trpcClient.aiProvider.updateAiProviderOrder.mutate({ sortMap: items });
  };

  deleteAiProvider: IAiProviderService['deleteAiProvider'] = async (id) => {
    return trpcClient.aiProvider.removeAiProvider.mutate({ id });
  };

  getAiProviderRuntimeState: IAiProviderService['getAiProviderRuntimeState'] = async (
    isLogin?: boolean,
  ) => {
    return trpcClient.aiProvider.getAiProviderRuntimeState.query({ isLogin });
  };
}
