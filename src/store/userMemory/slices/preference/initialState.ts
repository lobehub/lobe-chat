import { type DisplayPreferenceMemory } from '@/database/repositories/userMemory';
import { createReplicaState, type ReplicaState } from '@/libs/replica';

import { type PreferenceListData, preferenceListKey, type PreferenceListSort } from './projection';

/**
 * The preference list is a `@lobechat/replica` paged resource keyed per search
 * / sort. Its canonical value lives in `preferenceListEntries`; the
 * long-standing flat fields (`preferenceListData`, `preferences`,
 * `preferencesTotal`, `preferencesPage`, `preferencesHasMore`,
 * `preferencesInit`) are derived mirrors of the active query's entry so every
 * existing consumer keeps reading the place it always has.
 */
export interface PreferenceSliceState {
  /** View of the active query's page set. Mirror of `preferenceListEntries[preferenceListKey]`. */
  preferenceListData?: PreferenceListData;
  /**
   * Canonical replica views, one page set per search / sort. Engine-owned;
   * readers use the flat mirrors.
   */
  preferenceListEntries: Record<string, PreferenceListData>;
  /** Entry key of the query on screen (see `preferenceListKey`). */
  preferenceListKey: string;
  /** Local-first bookkeeping for `preferenceListEntries`. */
  preferenceListReplica: ReplicaState<PreferenceListData>;
  /** Rows of the loaded page set. Mirror of `preferenceListData.items`. */
  preferences: DisplayPreferenceMemory[];
  /** Mirror of `preferenceListData.hasMore`. */
  preferencesHasMore: boolean;
  /** Whether the active query has a view (persisted row hydrated or a page landed). */
  preferencesInit: boolean;
  /** Mirror of `preferenceListData.currentPage + 1`. */
  preferencesPage: number;
  preferencesQuery?: string;
  preferencesSort?: PreferenceListSort;
  /** Mirror of `preferenceListData.total`. */
  preferencesTotal: number;
}

export const preferenceInitialState: PreferenceSliceState = {
  preferences: [],
  preferencesHasMore: true,
  preferencesInit: false,
  preferencesPage: 1,
  preferencesQuery: undefined,
  preferencesSort: undefined,
  preferencesTotal: 0,
  preferenceListData: undefined,
  preferenceListEntries: {},
  preferenceListKey: preferenceListKey({}),
  preferenceListReplica: createReplicaState<PreferenceListData>(),
};
