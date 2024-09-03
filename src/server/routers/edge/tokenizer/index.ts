import { encode } from 'gpt-tokenizer/encoding/cl100k_base';
import { z } from 'zod';

import { publicProcedure, router } from '@/libs/trpc';

export const tokenizerRouter = router({
  countTokenLength: publicProcedure
    .input(z.object({ str: z.string() }))
    .mutation(async ({ input }) => {
      return encode(input.str).length;
    }),
});
