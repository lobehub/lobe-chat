import type {
  AddIdentityActionSchema,
  ContextMemoryItemSchema,
  ExperienceMemoryItemSchema,
  PreferenceMemoryItemSchema,
  RemoveIdentityActionSchema,
  UpdateIdentityActionSchema,
} from '@lobechat/memory-user-memory/schemas';
import { z } from 'zod';

import { lambdaClient } from '@/libs/trpc/client';
import {
  AddContextMemoryResult,
  AddExperienceMemoryResult,
  AddIdentityMemoryResult,
  AddPreferenceMemoryResult,
  LayersEnum,
  RemoveIdentityMemoryResult,
  SearchMemoryParams,
  SearchMemoryResult,
  UpdateIdentityMemoryResult,
} from '@/types/userMemory';

class UserMemoryService {
  addContextMemory = async (
    params: z.infer<typeof ContextMemoryItemSchema>,
  ): Promise<AddContextMemoryResult> => {
    return lambdaClient.userMemories.toolAddContextMemory.mutate(params);
  };

  addExperienceMemory = async (
    params: z.infer<typeof ExperienceMemoryItemSchema>,
  ): Promise<AddExperienceMemoryResult> => {
    return lambdaClient.userMemories.toolAddExperienceMemory.mutate(params);
  };

  addIdentityMemory = async (
    params: z.infer<typeof AddIdentityActionSchema>,
  ): Promise<AddIdentityMemoryResult> => {
    return lambdaClient.userMemories.toolAddIdentityMemory.mutate(params);
  };

  addPreferenceMemory = async (
    params: z.infer<typeof PreferenceMemoryItemSchema>,
  ): Promise<AddPreferenceMemoryResult> => {
    return lambdaClient.userMemories.toolAddPreferenceMemory.mutate(params);
  };

  removeIdentityMemory = async (
    params: z.infer<typeof RemoveIdentityActionSchema>,
  ): Promise<RemoveIdentityMemoryResult> => {
    return lambdaClient.userMemories.toolRemoveIdentityMemory.mutate(params);
  };

  retrieveMemory = async (params: SearchMemoryParams): Promise<SearchMemoryResult> => {
    return lambdaClient.userMemories.toolSearchMemory.query(params);
  };

  searchMemory = async (params: SearchMemoryParams): Promise<SearchMemoryResult> => {
    return lambdaClient.userMemories.toolSearchMemory.query(params);
  };

  queryTags = async (params?: { layers?: LayersEnum[]; page?: number; size?: number }) => {
    return lambdaClient.userMemories.queryTags.query(params);
  };

  queryIdentityRoles = async (params?: { page?: number; size?: number }) => {
    return lambdaClient.userMemories.queryIdentityRoles.query(params);
  };

  updateIdentityMemory = async (
    params: z.infer<typeof UpdateIdentityActionSchema>,
  ): Promise<UpdateIdentityMemoryResult> => {
    return lambdaClient.userMemories.toolUpdateIdentityMemory.mutate(params);
  };
}

export const userMemoryService = new UserMemoryService();
