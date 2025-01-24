// import { ModelProvider } from '@/libs/agent-runtime';
import { genUserLLMConfig } from '@/utils/genUserLLMConfig';

export const DEFAULT_LLM_CONFIG = genUserLLMConfig({
  lmstudio: {
    fetchOnClient: true,
  },
  ollama: {
    enabled: true,
    fetchOnClient: true,
  },
  openai: {
    enabled: true,
  },
});

export const DEFAULT_MODEL = process.env.NEXT_PUBLIC_DEFAULT_LLM_MODEL ?? 'gpt-35-turbo';

export const DEFAULT_EMBEDDING_MODEL = 'text-embedding-3-large';
export const DEFAULT_EMBEDDING_PROVIDER = process.env.NEXT_PUBLIC_DEFAULT_LLM_PROVIDER ?? 'azure';

export const DEFAULT_RERANK_MODEL = 'rerank-english-v3.0';
export const DEFAULT_RERANK_PROVIDER = 'cohere';
export const DEFAULT_RERANK_QUERY_MODE = 'full_text';

export const DEFAULT_PROVIDER = process.env.NEXT_PUBLIC_DEFAULT_LLM_PROVIDER ?? 'azure';
