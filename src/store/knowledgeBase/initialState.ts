import { KnowledgeBaseState, initialKnowledgeBaseState } from '../knowledgeBase/slices/crud';

export type KnowledgeBaseStoreState = KnowledgeBaseState;

export const initialState: KnowledgeBaseStoreState = {
  ...initialKnowledgeBaseState,
};
