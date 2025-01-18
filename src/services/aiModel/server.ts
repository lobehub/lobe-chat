import { lambdaClient } from '@/libs/trpc/client';
import { IAiModelService } from '@/services/aiModel/type';

export class ServerService implements IAiModelService {
  createAiModel: IAiModelService['createAiModel'] = async (params) => {
    return lambdaClient.aiModel.createAiModel.mutate(params);
  };

  getAiProviderModelList: IAiModelService['getAiProviderModelList'] = async (id) => {
    return lambdaClient.aiModel.getAiProviderModelList.query({ id });
  };

  getAiModelById: IAiModelService['getAiModelById'] = async (id) => {
    return lambdaClient.aiModel.getAiModelById.query({ id });
  };

  toggleModelEnabled: IAiModelService['toggleModelEnabled'] = async (params) => {
    return lambdaClient.aiModel.toggleModelEnabled.mutate(params);
  };

  updateAiModel: IAiModelService['updateAiModel'] = async (id, providerId, value) => {
    return lambdaClient.aiModel.updateAiModel.mutate({ id, providerId, value });
  };

  batchUpdateAiModels: IAiModelService['batchUpdateAiModels'] = async (id, models) => {
    return lambdaClient.aiModel.batchUpdateAiModels.mutate({ id, models });
  };

  batchToggleAiModels: IAiModelService['batchToggleAiModels'] = async (id, models, enabled) => {
    return lambdaClient.aiModel.batchToggleAiModels.mutate({ enabled, id, models });
  };

  clearRemoteModels: IAiModelService['clearRemoteModels'] = async (providerId) => {
    return lambdaClient.aiModel.clearRemoteModels.mutate({ providerId });
  };

  updateAiModelOrder: IAiModelService['updateAiModelOrder'] = async (providerId, items) => {
    return lambdaClient.aiModel.updateAiModelOrder.mutate({ providerId, sortMap: items });
  };

  deleteAiModel: IAiModelService['deleteAiModel'] = async (params: {
    id: string;
    providerId: string;
  }) => {
    return lambdaClient.aiModel.removeAiModel.mutate(params);
  };
}
