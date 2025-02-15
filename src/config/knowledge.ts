import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const getKnowledgeConfig = () => {
  return createEnv({
    runtimeEnv: {
      DEFAULT_FILES_CONFIG: process.env.DEFAULT_FILES_CONFIG,
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
