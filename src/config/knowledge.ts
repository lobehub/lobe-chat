import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const getKnowledgeConfig = () => {
  return createEnv({
    runtimeEnv: {
      UNSTRUCTURED_API_KEY: process.env.UNSTRUCTURED_API_KEY,
      UNSTRUCTURED_SERVER_URL: process.env.UNSTRUCTURED_SERVER_URL,
    },
    server: {
      UNSTRUCTURED_API_KEY: z.string().optional(),
      UNSTRUCTURED_SERVER_URL: z.string().optional(),
    },
  });
};

export const knowledgeEnv = getKnowledgeConfig();
