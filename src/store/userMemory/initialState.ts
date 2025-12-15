import type {
  DisplayContextMemory,
  DisplayExperienceMemory,
  DisplayPreferenceMemory,
} from '@/database/repositories/userMemory';
import type {
  RetrieveMemoryParams,
  RetrieveMemoryResult,
  TypesEnum,
  UserMemoryIdentityWithoutVectors,
} from '@/types/userMemory';

export interface UserMemoryStoreState {
  activeParams?: RetrieveMemoryParams;
  activeParamsKey?: string;
  contexts: DisplayContextMemory[];
  contextsHasMore: boolean;
  contextsInit: boolean;
  contextsPage: number;
  contextsQuery?: string;
  contextsSearchLoading?: boolean;
  contextsSort?: 'scoreImpact' | 'scoreUrgency';
  contextsTotal: number;
  experiences: DisplayExperienceMemory[];
  experiencesHasMore: boolean;
  experiencesInit: boolean;
  experiencesPage: number;
  experiencesQuery?: string;
  experiencesSearchLoading?: boolean;
  experiencesSort?: 'scoreConfidence';
  experiencesTotal: number;
  identities: UserMemoryIdentityWithoutVectors[];
  identitiesHasMore: boolean;
  identitiesInit: boolean;
  identitiesPage: number;
  identitiesQuery?: string;
  identitiesSearchLoading?: boolean;
  identitiesTotal: number;
  identitiesTypes?: TypesEnum[];
  memoryFetchedAtMap: Record<string, number>;
  memoryMap: Record<string, RetrieveMemoryResult>;
  preferences: DisplayPreferenceMemory[];
  preferencesHasMore: boolean;
  preferencesInit: boolean;
  preferencesPage: number;
  preferencesQuery?: string;
  preferencesSearchLoading?: boolean;
  preferencesSort?: 'scorePriority';
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
  contextsPage: 1,
  contextsQuery: undefined,
  contextsSort: undefined,
  contextsTotal: 0,
  experiences: [],
  experiencesHasMore: true,
  experiencesInit: false,
  experiencesPage: 1,
  experiencesQuery: undefined,
  experiencesSort: undefined,
  experiencesTotal: 0,
  identities: [],
  identitiesHasMore: true,
  identitiesInit: false,
  identitiesPage: 1,
  identitiesQuery: undefined,
  identitiesTotal: 0,
  identitiesTypes: undefined,
  memoryFetchedAtMap: {},
  memoryMap: {},
  preferences: [],
  preferencesHasMore: true,
  preferencesInit: false,
  preferencesPage: 1,
  preferencesQuery: undefined,
  preferencesSort: undefined,
  preferencesTotal: 0,
  roles: [],
  tags: [],
  tagsInit: false,
};
