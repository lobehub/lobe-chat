import type { RetrieveMemoryParams } from '@/types/userMemory';

export const userMemoryCacheKey = (params: RetrieveMemoryParams): string => {
  const { query, memoryCategory, memoryType, limit, topK } = params;

  return JSON.stringify({
    limit: limit ?? null,
    memoryCategory: memoryCategory ?? null,
    memoryType: memoryType ?? null,
    query,
    topK: topK ?? null,
  });
};
