import { Crawler } from '@lobechat/web-crawler';
import { TRPCError } from '@trpc/server';
import pMap from 'p-map';
import { z } from 'zod';

import { toolsEnv } from '@/config/tools';
import { isServerMode } from '@/const/version';
import { authedProcedure, passwordProcedure, router } from '@/libs/trpc';
import { SearXNGClient } from '@/server/modules/SearXNG';
import { SEARCH_SEARXNG_NOT_CONFIG } from '@/types/tool/search';

const searchProcedure = isServerMode ? authedProcedure : passwordProcedure;

export const searchRouter = router({
  crawlPages: searchProcedure
    .input(
      z.object({
        impls: z.enum(['jina', 'naive', 'browserless']).array().optional(),
        urls: z.string().array(),
      }),
    )
    .mutation(async ({ input }) => {
      const crawler = new Crawler();

      const results = await pMap(
        input.urls,
        async (url) => {
          return await crawler.crawl({ impls: input.impls, url });
        },
        { concurrency: 10 },
      );

      return { results };
    }),

  query: searchProcedure
    .input(
      z.object({
        query: z.string(),
        searchEngine: z.array(z.string()).optional(),
      }),
    )
    .query(async ({ input }) => {
      if (!toolsEnv.SEARXNG_URL) {
        throw new TRPCError({ code: 'NOT_IMPLEMENTED', message: SEARCH_SEARXNG_NOT_CONFIG });
      }

      const client = new SearXNGClient(toolsEnv.SEARXNG_URL);

      try {
        return await client.search(input.query, input.searchEngine);
      } catch (e) {
        console.error(e);

        throw new TRPCError({
          code: 'SERVICE_UNAVAILABLE',
          message: (e as Error).message,
        });
      }
    }),
});
