import { SystemEmbeddingConfig } from '@/types/knowledgeBase';

import { DEFAULT_SYSTEM_AGENT_ITEM } from './systemAgent';

export const SYSTEM_EMBEDDING_CONFIG: SystemEmbeddingConfig = {
  embedding_model: DEFAULT_SYSTEM_AGENT_ITEM,
  query_model: DEFAULT_SYSTEM_AGENT_ITEM,
  reranker_model: DEFAULT_SYSTEM_AGENT_ITEM,
};
