import type { SearchMemoryParams } from '@lobechat/types';
import type { AnyColumn } from 'drizzle-orm';

import type {
  UserMemoryActivitiesWithoutVectors,
  UserMemoryContextsWithoutVectors,
  UserMemoryExperiencesWithoutVectors,
  UserMemoryIdentitiesWithoutVectors,
  UserMemoryPreferencesWithoutVectors,
} from '../../../schemas';

export interface Bm25MatchFieldGroup {
  fields: string[];
  keyColumn: AnyColumn;
}

export type SearchLayerKey =
  'activities' | 'contexts' | 'experiences' | 'identities' | 'preferences';

export interface HybridSearchLayerMeta {
  hasMore: boolean;
  returned: number;
  total: number;
}

export interface LayerBaseMemorySignals {
  categories: string[];
  memoryIds: string[];
  tags: string[];
  times: number[];
}

export interface RecommendationScoreBreakdown {
  categoryAffinity: number;
  clusterBoost: number;
  final: number;
  fuzzy: number;
  keyword: number;
  semantic: number;
  tagAffinity: number;
  temporal: number;
}

export interface RankedSearchCandidate<T> {
  item: T;
  score: RecommendationScoreBreakdown;
}

export interface UserMemoryHybridSearchAggregatedResult {
  activities: UserMemoryActivitiesWithoutVectors[];
  contexts: UserMemoryContextsWithoutVectors[];
  experiences: UserMemoryExperiencesWithoutVectors[];
  identities: UserMemoryIdentitiesWithoutVectors[];
  meta: {
    appliedFilters: Omit<SearchMemoryParams, 'effort' | 'topK'>;
    appliedQueries: string[];
    layers: Record<SearchLayerKey, HybridSearchLayerMeta>;
    ranking: Partial<Record<SearchLayerKey, Record<string, RecommendationScoreBreakdown>>>;
  };
  preferences: UserMemoryPreferencesWithoutVectors[];
}
