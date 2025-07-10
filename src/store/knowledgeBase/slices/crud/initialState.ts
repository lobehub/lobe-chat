import { KnowledgeBaseItem } from '@/types/knowledgeBase';

export interface KnowledgeBaseState {
  activeKnowledgeBaseId: string | null;
  activeKnowledgeBaseItem?: KnowledgeBaseItem;
  initKnowledgeBaseList: boolean;
  knowledgeBaseLoadingIds: string[];
  knowledgeBaseRenamingId?: string | null;
}

export const initialKnowledgeBaseState: KnowledgeBaseState = {
  activeKnowledgeBaseId: null,
  initKnowledgeBaseList: false,
  knowledgeBaseLoadingIds: [],
};
