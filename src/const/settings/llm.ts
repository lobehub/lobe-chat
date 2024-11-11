import { ModelProvider } from '@/libs/agent-runtime';

import { genUserLLMConfig } from '@/utils/genLLMConfig'

export const DEFAULT_LLM_CONFIG = genUserLLMConfig();

export const DEFAULT_MODEL = 'gpt-4o-mini';
export const DEFAULT_EMBEDDING_MODEL = 'text-embedding-3-small';

export const DEFAULT_PROVIDER = ModelProvider.OpenAI;
