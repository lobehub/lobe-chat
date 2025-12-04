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
    return lambdaClient.userMemories.toolAddContextMemory.mutate(params);
  };

  addExperienceMemory = async (
    params: AddExperienceMemoryParams,
  ): Promise<AddExperienceMemoryResult> => {
    return lambdaClient.userMemories.toolAddExperienceMemory.mutate(params);
  };

  addIdentityMemory = async (params: AddIdentityMemoryParams): Promise<AddIdentityMemoryResult> => {
    return lambdaClient.userMemories.toolAddIdentityMemory.mutate(params);
  };

  addPreferenceMemory = async (
    params: AddPreferenceMemoryParams,
  ): Promise<AddPreferenceMemoryResult> => {
    return lambdaClient.userMemories.toolAddPreferenceMemory.mutate(params);
  };

  removeIdentityMemory = async (
    params: RemoveIdentityMemoryParams,
  ): Promise<RemoveIdentityMemoryResult> => {
    return lambdaClient.userMemories.toolRemoveIdentityMemory.mutate(params);
  };

  retrieveMemory = async (params: SearchMemoryParams): Promise<SearchMemoryResult> => {
    return lambdaClient.userMemories.toolSearchMemory.query(params);
  };

  searchMemory = async (params: SearchMemoryParams): Promise<SearchMemoryResult> => {
    return lambdaClient.userMemories.toolSearchMemory.query(params);
  };

  updateIdentityMemory = async (
    params: UpdateIdentityMemoryParams,
  ): Promise<UpdateIdentityMemoryResult> => {
    return lambdaClient.userMemories.toolUpdateIdentityMemory.mutate(params);
  };
}

export const userMemoryService = new UserMemoryService();
