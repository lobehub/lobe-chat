import { z } from 'zod';

import { isServerMode } from '@/const/version';
import { passwordProcedure } from '@/libs/trpc/edge';
import { authedProcedure, router } from '@/libs/trpc/lambda';
import { searchService } from '@/server/services/search';

// TODO: password procedure 未来的处理方式可能要思考下
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
      return searchService.crawlPages(input);
    }),

  query: searchProcedure
    .input(
      z.object({
        optionalParams: z
          .object({
            searchCategories: z.array(z.string()).optional(),
            searchEngines: z.array(z.string()).optional(),
            searchTimeRange: z.string().optional(),
          })
          .optional(),
        query: z.string(),
      }),
    )
    .query(async ({ input }) => {
      return await searchService.query(input.query, input.optionalParams);
    }),
});
