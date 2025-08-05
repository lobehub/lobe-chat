import { trpcClient } from '@/services/_auth/trpc';
import { IAiModelService } from './type';

export class ServerService implements IAiModelService {
  createAiModel: IAiModelService['createAiModel'] = async (params) => {
    return trpcClient.aiModel.createAiModel.mutate(params);
  };

  getAiProviderModelList: IAiModelService['getAiProviderModelList'] = async (id) => {
    return trpcClient.aiModel.getAiProviderModelList.query({ id });
  };

  getAiModelById: IAiModelService['getAiModelById'] = async (id) => {
    return trpcClient.aiModel.getAiModelById.query({ id });
  };

  toggleModelEnabled: IAiModelService['toggleModelEnabled'] = async (params) => {
    return trpcClient.aiModel.toggleModelEnabled.mutate(params);
  };

  updateAiModel: IAiModelService['updateAiModel'] = async (id, providerId, value) => {
    return trpcClient.aiModel.updateAiModel.mutate({ id, providerId, value });
  };

  batchUpdateAiModels: IAiModelService['batchUpdateAiModels'] = async (id, models) => {
    return trpcClient.aiModel.batchUpdateAiModels.mutate({ id, models });
  };

  batchToggleAiModels: IAiModelService['batchToggleAiModels'] = async (id, models, enabled) => {
    return trpcClient.aiModel.batchToggleAiModels.mutate({ enabled, id, models });
  };

  clearModelsByProvider: IAiModelService['clearModelsByProvider'] = async (providerId) => {
    return trpcClient.aiModel.clearModelsByProvider.mutate({ providerId });
  };

  clearRemoteModels: IAiModelService['clearRemoteModels'] = async (providerId) => {
    return trpcClient.aiModel.clearRemoteModels.mutate({ providerId });
  };

  updateAiModelOrder: IAiModelService['updateAiModelOrder'] = async (providerId, items) => {
    return trpcClient.aiModel.updateAiModelOrder.mutate({ providerId, sortMap: items });
  };

  deleteAiModel: IAiModelService['deleteAiModel'] = async (params: {
    id: string;
    providerId: string;
  }) => {
    return trpcClient.aiModel.removeAiModel.mutate(params);
  };
}
