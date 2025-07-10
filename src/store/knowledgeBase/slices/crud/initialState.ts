import { KnowledgeBaseItem } from '@/types/knowledgeBase';

export interface KnowledgeBaseState {
  activeKnowledgeBaseId: string | null;
  activeKnowledgeBaseItems: Record<string, KnowledgeBaseItem>;
  initKnowledgeBaseList: boolean;
  knowledgeBaseLoadingIds: string[];
  knowledgeBaseRenamingId?: string | null;
}

export const initialKnowledgeBaseState: KnowledgeBaseState = {
  activeKnowledgeBaseId: null,
  activeKnowledgeBaseItems: {},
  initKnowledgeBaseList: false,
  knowledgeBaseLoadingIds: [],
};
