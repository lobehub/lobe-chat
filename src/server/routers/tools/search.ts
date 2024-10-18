import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import { toolsEnv } from '@/config/tools';
import { isServerMode } from '@/const/version';
import { authedProcedure, passwordProcedure, router } from '@/libs/trpc';
import { SearXNGClient } from '@/server/modules/SearXNG';

const searchProcedure = isServerMode ? authedProcedure : passwordProcedure;

export const searchRouter = router({
  query: searchProcedure
    .input(
      z.object({
        query: z.string(),
        searchEngine: z.array(z.string()).optional(),
      }),
    )
    .query(async ({ input }) => {
      if (!toolsEnv.SEARXNG_URL) {
        throw new TRPCError({ code: 'SERVICE_UNAVAILABLE', message: 'SearXNG is not configured' });
      }

      const client = new SearXNGClient(toolsEnv.SEARXNG_URL);

      return await client.search(input.query, input.searchEngine);
    }),
});
