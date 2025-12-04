import { lambdaClient } from '@/libs/trpc/client';
import {
  AddContextMemoryParams,
  AddContextMemoryResult,
  AddExperienceMemoryParams,
  AddExperienceMemoryResult,
  AddIdentityMemoryParams,
  AddIdentityMemoryResult,
  AddPreferenceMemoryParams,
  AddPreferenceMemoryResult,
  RemoveIdentityMemoryParams,
  RemoveIdentityMemoryResult,
  SearchMemoryParams,
  SearchMemoryResult,
  UpdateIdentityMemoryParams,
  UpdateIdentityMemoryResult,
} from '@/types/userMemory';

class UserMemoryService {
  addContextMemory = async (params: AddContextMemoryParams): Promise<AddContextMemoryResult> => {
    return lambdaClient.userMemories.tools.addContextMemory.mutate(params);
  };

  addExperienceMemory = async (
    params: AddExperienceMemoryParams,
  ): Promise<AddExperienceMemoryResult> => {
    return lambdaClient.userMemories.tools.addExperienceMemory.mutate(params);
  };

  addIdentityMemory = async (params: AddIdentityMemoryParams): Promise<AddIdentityMemoryResult> => {
    return lambdaClient.userMemories.tools.addIdentityMemory.mutate(params);
  };

  addPreferenceMemory = async (
    params: AddPreferenceMemoryParams,
  ): Promise<AddPreferenceMemoryResult> => {
    return lambdaClient.userMemories.tools.addPreferenceMemory.mutate(params);
  };

  removeIdentityMemory = async (
    params: RemoveIdentityMemoryParams,
  ): Promise<RemoveIdentityMemoryResult> => {
    return lambdaClient.userMemories.tools.removeIdentityMemory.mutate(params);
  };

  retrieveMemory = async (params: SearchMemoryParams): Promise<SearchMemoryResult> => {
    return lambdaClient.userMemories.searchMemory.query(params);
  };

  searchMemory = async (params: SearchMemoryParams): Promise<SearchMemoryResult> => {
    return lambdaClient.userMemories.tools.searchMemory.query(params);
  };

  updateIdentityMemory = async (
    params: UpdateIdentityMemoryParams,
  ): Promise<UpdateIdentityMemoryResult> => {
    return lambdaClient.userMemories.tools.updateIdentityMemory.mutate(params);
  };
}

export const userMemoryService = new UserMemoryService();
