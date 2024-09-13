export interface KnowledgeBaseState {
  activeKnowledgeBaseId: string | null;
  initKnowledgeBaseList: boolean;
  knowledgeBaseLoadingIds: string[];
  knowledgeBaseRenamingId?: string | null;
}

export const initialKnowledgeBaseState: KnowledgeBaseState = {
  activeKnowledgeBaseId: null,
  initKnowledgeBaseList: false,
  knowledgeBaseLoadingIds: [],
};
