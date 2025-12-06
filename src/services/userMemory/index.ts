import { NewUserMemoryIdentity } from '@lobechat/types';

import { lambdaClient } from '@/libs/trpc/client';

class MemoryCRUDService {
  createIdentity = async (data: NewUserMemoryIdentity) => {
    return lambdaClient.userMemory.createIdentity.mutate(data);
  };

  deleteIdentity = async (id: string) => {
    return lambdaClient.userMemory.deleteIdentity.mutate({ id });
  };

  getContexts = async () => {
    return lambdaClient.userMemory.getContexts.query();
  };

  getDisplayExperiences = async () => {
    return lambdaClient.userMemory.getDisplayExperiences.query();
  };

  getExperiences = async () => {
    return lambdaClient.userMemory.getExperiences.query();
  };

  getIdentities = async () => {
    return lambdaClient.userMemory.getIdentities.query();
  };

  getPreferences = async () => {
    return lambdaClient.userMemory.getPreferences.query();
  };

  updateIdentity = async (id: string, data: Partial<NewUserMemoryIdentity>) => {
    return lambdaClient.userMemory.updateIdentity.mutate({ data, id });
  };
}

export const memoryCRUDService = new MemoryCRUDService();

// Backward compatibility alias
export const memoryService = memoryCRUDService;
