import { KnowledgeBaseStoreState } from '@/store/knowledgeBase/initialState';

const activeDatasetId = (s: KnowledgeBaseStoreState) => s.activeDatasetId;

export const ragEvalSelectors = {
  activeDatasetId,
};
