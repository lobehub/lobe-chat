import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const getToolsConfig = () => {
  return createEnv({
    runtimeEnv: {
      CRAWLER_IMPLS: process.env.CRAWLER_IMPLS,
      SEARXNG_URL: process.env.SEARXNG_URL,
    },

    server: {
      CRAWLER_IMPLS: z.string().optional(),
      SEARXNG_URL: z.string().url().optional(),
    },
  });
};

export const toolsEnv = getToolsConfig();
