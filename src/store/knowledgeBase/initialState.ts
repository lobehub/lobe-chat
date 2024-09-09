import { KnowledgeBaseState, initialKnowledgeBaseState } from '../knowledgeBase/slices/crud';
import { RAGEvalState, initialDatasetState } from '../knowledgeBase/slices/ragEval';

export type KnowledgeBaseStoreState = KnowledgeBaseState & RAGEvalState;

export const initialState: KnowledgeBaseStoreState = {
  ...initialKnowledgeBaseState,
  ...initialDatasetState,
};
