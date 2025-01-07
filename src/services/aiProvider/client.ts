import { clientDB } from '@/database/client/db';
import { AiInfraRepos } from '@/database/repositories/aiInfra';
import { AiProviderModel } from '@/database/server/models/aiProvider';
import { BaseClientService } from '@/services/baseClientService';

import { IAiProviderService } from './type';

const encrypt = async (keyVaults: any) => JSON.stringify(keyVaults);
const decrypt = (str: string | null) => JSON.parse(str as string);

export class ClientService extends BaseClientService implements IAiProviderService {
  private get aiProviderModel(): AiProviderModel {
    return new AiProviderModel(clientDB as any, this.userId);
  }
  private get aiInfraRepos(): AiInfraRepos {
    return new AiInfraRepos(clientDB as any, this.userId, {});
  }

  createAiProvider: IAiProviderService['createAiProvider'] = async (params) => {
    const data = await this.aiProviderModel.create(params, encrypt);

    return data?.id;
  };

  getAiProviderById: IAiProviderService['getAiProviderById'] = async (id) => {
    return this.aiProviderModel.getAiProviderById(id, decrypt);
  };

  getAiProviderList: IAiProviderService['getAiProviderList'] = async () => {
    return await this.aiInfraRepos.getAiProviderList();
  };

  getAiProviderRuntimeState: IAiProviderService['getAiProviderRuntimeState'] = async () => {
    const runtimeConfig = await this.aiProviderModel.getAiProviderRuntimeConfig(decrypt);

    const enabledAiProviders = await this.aiInfraRepos.getUserEnabledProviderList();

    const enabledAiModels = await this.aiInfraRepos.getEnabledModels();

    return { enabledAiModels, enabledAiProviders, runtimeConfig };
  };

  toggleProviderEnabled: IAiProviderService['toggleProviderEnabled'] = async (id, enabled) => {
    return this.aiProviderModel.toggleProviderEnabled(id, enabled);
  };

  updateAiProvider: IAiProviderService['updateAiProvider'] = async (id, value) => {
    return this.aiProviderModel.update(id, value);
  };

  updateAiProviderConfig: IAiProviderService['updateAiProviderConfig'] = async (id, value) => {
    return this.aiProviderModel.updateConfig(id, value, encrypt);
  };

  updateAiProviderOrder: IAiProviderService['updateAiProviderOrder'] = async (items) => {
    return this.aiProviderModel.updateOrder(items);
  };

  deleteAiProvider: IAiProviderService['deleteAiProvider'] = async (id) => {
    return this.aiProviderModel.delete(id);
  };
}
