import { SystemAgentItem } from '@/types/user/settings';

import { DEFAULT_SYSTEM_AGENT_ITEM } from './systemAgent';

export interface SystemEmbeddingConfig {
  embedding_model: SystemAgentItem;
  query_mode: SystemAgentItem;
  reranker_model: SystemAgentItem;
}

export const SYSTEM_EMBEDDING_CONFIG: SystemEmbeddingConfig = {
  embedding_model: DEFAULT_SYSTEM_AGENT_ITEM,
  query_mode: DEFAULT_SYSTEM_AGENT_ITEM,
  reranker_model: DEFAULT_SYSTEM_AGENT_ITEM,
};
