import { SWRResponse, mutate } from 'swr';
import { StateCreator } from 'zustand/vanilla';

import { useClientDataSWR } from '@/libs/swr';
import { ragEvalService } from '@/services/ragEval';
import { KnowledgeBaseStore } from '@/store/knowledgeBase/store';
import { CreateNewEvalEvaluation, RAGEvalDataSetItem } from '@/types/eval';

const FETCH_EVALUATION_LIST_KEY = 'FETCH_EVALUATION_LIST_KEY';

export interface RAGEvalEvaluationAction {
  checkEvaluationStatus: (id: number) => Promise<void>;

  createNewEvaluation: (params: CreateNewEvalEvaluation) => Promise<void>;
  refreshEvaluationList: () => Promise<void>;

  removeEvaluation: (id: number) => Promise<void>;
  runEvaluation: (id: number) => Promise<void>;

  useFetchEvaluationList: (knowledgeBaseId: string) => SWRResponse<RAGEvalDataSetItem[]>;
}

export const createRagEvalEvaluationSlice: StateCreator<
  KnowledgeBaseStore,
  [['zustand/devtools', never]],
  [],
  RAGEvalEvaluationAction
> = (set, get) => ({
  checkEvaluationStatus: async (id) => {
    await ragEvalService.checkEvaluationStatus(id);
  },

  createNewEvaluation: async (params) => {
    await ragEvalService.createEvaluation(params);
    await get().refreshEvaluationList();
  },
  refreshEvaluationList: async () => {
    await mutate(FETCH_EVALUATION_LIST_KEY);
  },

  removeEvaluation: async (id) => {
    await ragEvalService.removeEvaluation(id);
    // await get().refreshEvaluationList();
  },

  runEvaluation: async (id) => {
    await ragEvalService.startEvaluationTask(id);
  },

  useFetchEvaluationList: (knowledgeBaseId) =>
    useClientDataSWR<RAGEvalDataSetItem[]>(
      [FETCH_EVALUATION_LIST_KEY, knowledgeBaseId],
      () => ragEvalService.getEvaluationList(knowledgeBaseId),
      {
        fallbackData: [],
        onSuccess: () => {
          if (!get().initDatasetList)
            set({ initDatasetList: true }, false, 'useFetchDatasets/init');
        },
      },
    ),
});
