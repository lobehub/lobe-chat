export type { SearchMemoryParams as RetrieveMemoryParams } from '@/types/userMemory';

export const MemoryApiName = {
  addContextMemory: 'userMemory_addContextMemory',
  addExperienceMemory: 'userMemory_addExperienceMemory',
  addIdentityMemory: 'userMemory_addIdentityMemory',
  addPreferenceMemory: 'userMemory_addPreferenceMemory',
  removeIdentityMemory: 'userMemory_removeIdentityMemory',
  searchUserMemory: 'userMemory_searchUserMemory',
  updateIdentityMemory: 'userMemory_updateIdentityMemory',
} as const;

export const UserMemoryApiName = MemoryApiName;
