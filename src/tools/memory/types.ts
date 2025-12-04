export type { SearchMemoryParams as RetrieveMemoryParams } from '@/types/userMemory';

export const MemoryApiName = {
  addContextMemory: 'addContextMemory',
  addExperienceMemory: 'addExperienceMemory',
  addIdentityMemory: 'addIdentityMemory',
  addPreferenceMemory: 'addPreferenceMemory',
  removeIdentityMemory: 'removeIdentityMemory',
  searchUserMemory: 'searchUserMemory',
  updateIdentityMemory: 'updateIdentityMemory',
} as const;

export const UserMemoryApiName = MemoryApiName;
