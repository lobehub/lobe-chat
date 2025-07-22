import { lambdaClient } from '@/libs/trpc/client';

import { IApiKeyService } from './type';

export class ServerService implements IApiKeyService {
  create: IApiKeyService['create'] = async (params) => {
    return lambdaClient.apiKey.createApiKey.mutate(params);
  };

  delete: IApiKeyService['delete'] = async (id) => {
    await lambdaClient.apiKey.deleteApiKey.mutate({ id });
  };

  deleteAll: IApiKeyService['deleteAll'] = async () => {
    await lambdaClient.apiKey.deleteAllApiKeys.mutate();
  };

  getById: IApiKeyService['getById'] = async (id) => {
    const result = await lambdaClient.apiKey.getApiKeyById.query({ id });
    if (!result) {
      throw new Error('API Key not found');
    }
    return result;
  };

  list: IApiKeyService['list'] = async () => {
    return lambdaClient.apiKey.getApiKeys.query();
  };

  update: IApiKeyService['update'] = async (id, params) => {
    await lambdaClient.apiKey.updateApiKey.mutate({ id, value: params });
  };

  validate: IApiKeyService['validate'] = async (key) => {
    return lambdaClient.apiKey.validateApiKey.query({ key });
  };
}
