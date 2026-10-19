import type { TaskTemplate } from '@lobechat/const';
import { shallow } from 'zustand/shallow';
import { createWithEqualityFn } from 'zustand/traditional';

import {
  createReplicaSlice,
  createReplicaState,
  recordLens,
  type ReplicaState,
} from '@/libs/replica';
import { taskTemplateService } from '@/services/taskTemplate';
import { createDevtools } from '@/store/middleware/createDevtools';

import {
  type DailyRecommendParams,
  dailyRecommendResource,
  normalizeTaskTemplateRecommendations,
} from './projection';

export const fetchDailyRecommendations = async ({
  count,
  interestKeys,
  locale,
  refreshSeed,
}: DailyRecommendParams): Promise<TaskTemplate[]> => {
  // The sync only runs once interests resolve (see `useDailyBriefRecommendationsUI`).
  if (!interestKeys) throw new Error('[taskTemplate:listDailyRecommend] interests not resolved');
  const result = await taskTemplateService.listDailyRecommend(interestKeys, {
    count,
    locale,
    refreshSeed: refreshSeed || undefined,
  });
  return normalizeTaskTemplateRecommendations(result?.data);
};

export interface TaskTemplateRecommendationStoreState {
  /** `dailyRecommendKey(params)` → the recommended templates. */
  dailyRecommendMap: Record<string, TaskTemplate[]>;
  dailyRecommendReplica: ReplicaState<TaskTemplate[]>;
}

export const initialTaskTemplateRecommendationState: TaskTemplateRecommendationStoreState = {
  dailyRecommendMap: {},
  dailyRecommendReplica: createReplicaState(),
};

const devtools = createDevtools('taskTemplateRecommendation');

export const useTaskTemplateRecommendationStore =
  createWithEqualityFn<TaskTemplateRecommendationStoreState>()(
    devtools(() => initialTaskTemplateRecommendationState),
    shallow,
  );

export const dailyRecommendReplica = createReplicaSlice(dailyRecommendResource, {
  actionPrefix: 'taskTemplate/dailyRecommend',
  fetcher: fetchDailyRecommendations,
  get: useTaskTemplateRecommendationStore.getState,
  // A row persisted by an older or corrupted write is not a list: fetch instead.
  isHydratable: (cached) => Array.isArray(cached),
  set: useTaskTemplateRecommendationStore.setState,
  stateKey: 'dailyRecommendReplica',
  view: recordLens<TaskTemplateRecommendationStoreState, TaskTemplate[]>('dailyRecommendMap'),
});
