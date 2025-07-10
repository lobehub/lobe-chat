import { KnowledgeBaseStoreState } from '@/store/knowledgeBase/initialState';

const activeKnowledgeBaseId = (s: KnowledgeBaseStoreState) => s.activeKnowledgeBaseId;
const activeKnowledgeBaseItem = (s: KnowledgeBaseStoreState) => s.activeKnowledgeBaseItem;
const activeKnowledgeBaseName = (s: KnowledgeBaseStoreState) => s.activeKnowledgeBaseItem?.name;

export const knowledgeBaseSelectors = {
  activeKnowledgeBaseId,
  activeKnowledgeBaseItem,
  activeKnowledgeBaseName,
};
