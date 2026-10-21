import { z } from 'zod';

import { withScopedPermission } from '@/business/server/trpc-middlewares/rbacPermission';
import { wsCompatProcedure } from '@/business/server/trpc-middlewares/workspaceAuth';
import { SessionModel } from '@/database/models/session';
import { insertAgentSchema, insertSessionSchema } from '@/database/schemas';
import { router } from '@/libs/trpc/lambda';
import { serverDatabase } from '@/libs/trpc/lambda/middleware';

import { assertWorkspaceRowManageable } from './_helpers/assertWorkspaceRowManageable';

const sessionProcedure = wsCompatProcedure.use(serverDatabase).use(async (opts) => {
  const { ctx } = opts;
  const wsId = ctx.workspaceId ?? undefined;

  return opts.next({
    ctx: {
      sessionModel: new SessionModel(ctx.serverDB, ctx.userId, wsId),
    },
  });
});

/**
 * @deprecated Session router is legacy. Use agent router for agent CRUD operations.
 * Session-based agent creation (createSession) should migrate
 * to agent.createAgent which uses agentModel.create directly.
 * Retains legacy session creation and session-shell updates for compatibility.
 */
export const sessionRouter = router({
  /** @deprecated Use agent.createAgent instead */
  createSession: sessionProcedure
    .use(withScopedPermission('session:create'))
    .input(
      z.object({
        config: insertAgentSchema
          .omit({
            chatConfig: true,
            openingMessage: true,
            openingQuestions: true,
            plugins: true,
            tags: true,
            tts: true,
          })
          .passthrough()
          .partial(),
        session: insertSessionSchema.omit({ createdAt: true, updatedAt: true }).partial(),
        type: z.enum(['agent', 'group']),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const data = await ctx.sessionModel.create(input);

      return data.id;
    }),

  updateSession: sessionProcedure
    .use(withScopedPermission('session:update'))
    .input(
      z.object({
        id: z.string(),
        value: insertSessionSchema.partial(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const session = await ctx.sessionModel.findByIdOrSlug(input.id);
      if (session) assertWorkspaceRowManageable(ctx, session.userId, 'session');

      return ctx.sessionModel.update(input.id, input.value);
    }),
});

export type SessionRouter = typeof sessionRouter;
