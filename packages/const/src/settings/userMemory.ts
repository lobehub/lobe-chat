import { UserMemoryConfig, UserMemoryConfigItem } from '@lobechat/types';

import { DEFAULT_EMBEDDING_MODEL, DEFAULT_EMBEDDING_PROVIDER } from './llm';

export const DEFAULT_USER_MEMORY_EMBEDDING_MODEL_ITEM: UserMemoryConfigItem = {
  model: DEFAULT_EMBEDDING_MODEL,
  provider: DEFAULT_EMBEDDING_PROVIDER,
};

export const DEFAULT_USER_MEMORY_CONFIG: UserMemoryConfig = {
  embeddingModel: DEFAULT_USER_MEMORY_EMBEDDING_MODEL_ITEM,
};
