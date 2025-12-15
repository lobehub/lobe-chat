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
  contextsHasMore: boolean;
  contextsInit: boolean;
  contextsIsLoading: boolean;
  contextsPage: number;
  contextsTotal: number;
  experiences: DisplayExperienceMemory[];
  experiencesHasMore: boolean;
  experiencesInit: boolean;
  experiencesIsLoading: boolean;
  experiencesPage: number;
  experiencesTotal: number;
  identities: UserMemoryIdentityWithoutVectors[];
  identitiesHasMore: boolean;
  identitiesInit: boolean;
  identitiesIsLoading: boolean;
  identitiesPage: number;
  identitiesTotal: number;
  memoryFetchedAtMap: Record<string, number>;
  memoryMap: Record<string, RetrieveMemoryResult>;
  preferences: DisplayPreferenceMemory[];
  preferencesHasMore: boolean;
  preferencesInit: boolean;
  preferencesIsLoading: boolean;
  preferencesPage: number;
  preferencesTotal: number;
  roles: { count: number; tag: string }[];
  tags: { count: number; tag: string }[];
  tagsInit: boolean;
}

export const initialState: UserMemoryStoreState = {
  activeParams: undefined,
  activeParamsKey: undefined,
  contexts: [],
  contextsHasMore: true,
  contextsInit: false,
  contextsIsLoading: false,
  contextsPage: 1,
  contextsTotal: 0,
  experiences: [],
  experiencesHasMore: true,
  experiencesInit: false,
  experiencesIsLoading: false,
  experiencesPage: 1,
  experiencesTotal: 0,
  identities: [],
  identitiesHasMore: true,
  identitiesInit: false,
  identitiesIsLoading: false,
  identitiesPage: 1,
  identitiesTotal: 0,
  memoryFetchedAtMap: {},
  memoryMap: {},
  preferences: [],
  preferencesHasMore: true,
  preferencesInit: false,
  preferencesIsLoading: false,
  preferencesPage: 1,
  preferencesTotal: 0,
  roles: [],
  tags: [],
  tagsInit: false,
};
