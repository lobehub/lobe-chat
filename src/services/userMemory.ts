import { lambdaClient } from '@/libs/trpc/client';
import {
  CategorizeMemoryContextParams,
  CategorizeMemoryContextResult,
  CategorizeMemoryPreferenceParams,
  CategorizeMemoryPreferenceResult,
  RetrieveMemoryParams,
  RetrieveMemoryResult,
  SaveMemoryParams,
  SaveMemoryResult,
} from '@/types/userMemory';

class UserMemoryService {
  categorizeContext = async (
    params: CategorizeMemoryContextParams,
  ): Promise<CategorizeMemoryContextResult> => {
    return lambdaClient.memory.categorizeContext.mutate(params);
  };

  categorizePreference = async (
    params: CategorizeMemoryPreferenceParams,
  ): Promise<CategorizeMemoryPreferenceResult> => {
    return lambdaClient.memory.categorizePreference.mutate(params);
  };

  saveMemory = async (params: SaveMemoryParams): Promise<SaveMemoryResult> => {
    return lambdaClient.memory.saveMemory.mutate(params);
  };

  retrieveMemory = async (params: RetrieveMemoryParams): Promise<RetrieveMemoryResult> => {
    return lambdaClient.memory.retrieveMemory.query(params);
  };
}

export const userMemoryService = new UserMemoryService();
