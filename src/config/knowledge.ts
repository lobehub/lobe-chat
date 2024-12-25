import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const getKnowledgeConfig = () => {
  return createEnv({
    runtimeEnv: {
      DEFAULT_FILES_CONFIG: !!process.env.DEFAULT_FILES_CONFIG
        ? process.env.DEFAULT_FILES_CONFIG
        : 'embedding_model=openai/embedding-text-3-small,reranker_model=cohere/rerank-english-v3.0,query_mode=full_text',
      UNSTRUCTURED_API_KEY: process.env.UNSTRUCTURED_API_KEY,
      UNSTRUCTURED_SERVER_URL: process.env.UNSTRUCTURED_SERVER_URL,
    },
    server: {
      DEFAULT_FILES_CONFIG: z.string().optional(),
      UNSTRUCTURED_API_KEY: z.string().optional(),
      UNSTRUCTURED_SERVER_URL: z.string().optional(),
    },
  });
};

export const knowledgeEnv = getKnowledgeConfig();
