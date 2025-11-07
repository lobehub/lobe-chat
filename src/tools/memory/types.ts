export type { SearchMemoryParams as RetrieveMemoryParams } from '@/types/userMemory';

export const MemoryApiName = {
  searchUserMemory: 'searchUserMemory',
} as const;

export const UserMemoryApiName = MemoryApiName;
