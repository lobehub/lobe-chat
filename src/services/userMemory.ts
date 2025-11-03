import { lambdaClient } from '@/libs/trpc/client';
import {
  RetrieveMemoryParams,
  RetrieveMemoryResult,
  SearchMemoryParams,
  SearchMemoryResult,
} from '@/types/userMemory';

class UserMemoryService {
  searchMemory = async (params: SearchMemoryParams): Promise<SearchMemoryResult> => {
    return lambdaClient.userMemories.toolSearchMemory.query(params);
  };

  retrieveMemory = async (params: RetrieveMemoryParams): Promise<RetrieveMemoryResult> => {
    return lambdaClient.userMemories.searchMemory.query(params);
  };
}

export const userMemoryService = new UserMemoryService();
