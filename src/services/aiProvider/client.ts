import { clientDB } from '@/database/client/db';
import { AiProviderModel } from '@/database/models/aiProvider';
import { AiInfraRepos } from '@/database/repositories/aiInfra';
import { BaseClientService } from '@/services/baseClientService';

import { IAiProviderService } from './type';

export class ClientService extends BaseClientService implements IAiProviderService {
  private get aiProviderModel(): AiProviderModel {
    return new AiProviderModel(clientDB as any, this.userId);
  }
  private get aiInfraRepos(): AiInfraRepos {
    let config = {};
    if (typeof window !== 'undefined') {
      config = window.global_serverConfigStore.getState().serverConfig.aiProvider || {};
    }

    return new AiInfraRepos(clientDB as any, this.userId, config);
  }

  createAiProvider: IAiProviderService['createAiProvider'] = async (params) => {
    const data = await this.aiProviderModel.create(params);

    return data?.id;
  };

  getAiProviderById: IAiProviderService['getAiProviderById'] = async (id) => {
    return this.aiInfraRepos.getAiProviderDetail(id);
  };

  getAiProviderList: IAiProviderService['getAiProviderList'] = async () => {
    return await this.aiInfraRepos.getAiProviderList();
  };

  getAiProviderRuntimeState: IAiProviderService['getAiProviderRuntimeState'] = async () => {
    return await this.aiInfraRepos.getAiProviderRuntimeState();
  };

  toggleProviderEnabled: IAiProviderService['toggleProviderEnabled'] = async (id, enabled) => {
    return this.aiProviderModel.toggleProviderEnabled(id, enabled);
  };

  updateAiProvider: IAiProviderService['updateAiProvider'] = async (id, value) => {
    return this.aiProviderModel.update(id, value);
  };

  updateAiProviderConfig: IAiProviderService['updateAiProviderConfig'] = async (id, value) => {
    return this.aiProviderModel.updateConfig(id, value);
  };

  updateAiProviderOrder: IAiProviderService['updateAiProviderOrder'] = async (items) => {
    return this.aiProviderModel.updateOrder(items);
  };

  deleteAiProvider: IAiProviderService['deleteAiProvider'] = async (id) => {
    return this.aiProviderModel.delete(id);
  };
}
