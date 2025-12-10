import type { QueryTagsResult } from '@/database/models/userMemory';
import type {
  DisplayContextMemory,
  DisplayExperienceMemory,
  DisplayPreferenceMemory,
} from '@/database/repositories/userMemory';
import type {
  RetrieveMemoryParams,
  RetrieveMemoryResult,
  UserMemoryIdentityWithoutVectors,
} from '@/types/userMemory';

export interface UserMemoryStoreState {
  activeParams?: RetrieveMemoryParams;
  activeParamsKey?: string;
  contexts: DisplayContextMemory[];
  contextsInit: boolean;
  experiences: DisplayExperienceMemory[];
  experiencesInit: boolean;
  identities: UserMemoryIdentityWithoutVectors[];
  identitiesInit: boolean;
  memoryFetchedAtMap: Record<string, number>;
  memoryMap: Record<string, RetrieveMemoryResult>;
  preferences: DisplayPreferenceMemory[];
  preferencesInit: boolean;
  tags: QueryTagsResult[];
  tagsInit: boolean;
}

export const initialState: UserMemoryStoreState = {
  activeParams: undefined,
  activeParamsKey: undefined,
  contexts: [],
  contextsInit: false,
  experiences: [],
  experiencesInit: false,
  identities: [],
  identitiesInit: false,
  memoryFetchedAtMap: {},
  memoryMap: {},
  preferences: [],
  preferencesInit: false,
  tags: [],
  tagsInit: false,
};
