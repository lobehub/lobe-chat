import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import {
  requireWorkspaceRoleWhenScoped,
  wsCompatProcedure,
} from '@/business/server/trpc-middlewares/workspaceAuth';
import { router } from '@/libs/trpc/lambda';
import { serverDatabase } from '@/libs/trpc/lambda/middleware';
import { initModelRuntimeFromDB } from '@/server/modules/ModelRuntime';

const synthesizeInput = z.object({
  input: z.string().min(1),
  model: z.string().min(1),
  provider: z.string().min(1).default('openai'),
  speed: z.number().min(0.25).max(4).optional(),
  voice: z.string().min(1).default('alloy'),
});

const ttsProcedure = wsCompatProcedure
  .use(serverDatabase)
  .use(requireWorkspaceRoleWhenScoped('member'));

export const ttsRouter = router({
  synthesize: ttsProcedure.input(synthesizeInput).mutation(async ({ ctx, input }) => {
    const { provider, ...payload } = input;
    const runtime = await initModelRuntimeFromDB(
      ctx.serverDB,
      ctx.userId,
      provider,
      ctx.workspaceId ?? undefined,
    );

    const audio = await runtime.textToSpeech(payload, { user: ctx.userId });

    if (!audio) {
      throw new TRPCError({
        code: 'NOT_IMPLEMENTED',
        message: `Provider "${provider}" does not support text-to-speech.`,
      });
    }

    return { audioBase64: Buffer.from(audio).toString('base64') };
  }),
});
