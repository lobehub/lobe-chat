import { KnowledgeBaseStoreState } from '@/store/knowledgeBase/initialState';

const activeKnowledgeBaseId = (s: KnowledgeBaseStoreState) => s.activeKnowledgeBaseId;

export const knowledgeBaseSelectors = {
  activeKnowledgeBaseId,
};
