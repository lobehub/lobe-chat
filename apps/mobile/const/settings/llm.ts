import { ModelProvider } from '@/mobile/types/agent';

export const DEFAULT_MODEL = 'gpt-4o-mini';

export const DEFAULT_EMBEDDING_MODEL = 'text-embedding-3-small';
export const DEFAULT_EMBEDDING_PROVIDER = ModelProvider.OpenAI;

export const DEFAULT_RERANK_MODEL = 'rerank-english-v3.0';
export const DEFAULT_RERANK_PROVIDER = 'cohere';
export const DEFAULT_RERANK_QUERY_MODE = 'full_text';

export const DEFAULT_PROVIDER = ModelProvider.OpenAI;
