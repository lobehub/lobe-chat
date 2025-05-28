import { clientDB } from '@/database/client/db';
import { ApiKeyModel } from '@/database/models/apiKey';
import { BaseClientService } from '@/services/baseClientService';

import { IApiKeyService } from './type';

export class ClientService extends BaseClientService implements IApiKeyService {
  private get apiKey(): ApiKeyModel {
    return new ApiKeyModel(clientDB as any, this.userId);
  }

  create: IApiKeyService['create'] = async (params) => {
    return this.apiKey.create(params);
  };

  delete: IApiKeyService['delete'] = async (id) => {
    await this.apiKey.delete(id);
  };

  deleteAll: IApiKeyService['deleteAll'] = async () => {
    await this.apiKey.deleteAll();
  };

  getById: IApiKeyService['getById'] = async (id) => {
    const result = await this.apiKey.findById(id);
    if (!result) {
      throw new Error('API Key not found');
    }
    return result;
  };

  list: IApiKeyService['list'] = async () => {
    return this.apiKey.query();
  };

  update: IApiKeyService['update'] = async (id, params) => {
    await this.apiKey.update(id, params);
  };

  validate: IApiKeyService['validate'] = async (key) => {
    return this.apiKey.validateKey(key);
  };
}
