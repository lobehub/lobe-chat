import { AGENT_SIGNAL_SOURCE_TYPES } from '@lobechat/agent-signal/source';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import { withScopedPermission } from '@/business/server/trpc-middlewares/rbacPermission';
import { wsCompatProcedure } from '@/business/server/trpc-middlewares/workspaceAuth';
import { QuickNoteModel } from '@/database/models/quickNote';
import { router } from '@/libs/trpc/lambda';
import { serverDatabase } from '@/libs/trpc/lambda/middleware';
import { enqueueAgentSignalSourceEvent } from '@/server/services/agentSignal';
import { QuickNoteProcessingService } from '@/server/services/quickNote';

const quickNoteProcedure = wsCompatProcedure.use(serverDatabase);
const quickNoteWriteProcedure = quickNoteProcedure.use(withScopedPermission('agent:update'));

const idInput = z.object({ id: z.string() });
const editorDataSchema = z.record(z.string(), z.unknown());

const createInput = z.object({
  collection: z.string().nullish(),
  content: z.string().default(''),
  editorData: editorDataSchema.optional(),
  location: z.string().nullish(),
  tags: z.array(z.string()).max(20).default([]),
});

const updateInput = z.object({
  content: z.string(),
  editorData: editorDataSchema,
  id: z.string(),
});

/**
 * Server-owned Quick Note CRUD and Agent Run entrypoints.
 *
 * The existing UI consumes this router through `quickNoteService`; capture
 * content remains Document-backed and every mutation is owner/workspace scoped.
 */
export const quickNoteRouter = router({
  claimDiscovery: quickNoteWriteProcedure.input(idInput).mutation(async ({ ctx, input }) => {
    if (!(await QuickNoteModel.isAutomaticDiscoveryEnabled(ctx.serverDB, ctx.userId))) {
      return { accepted: false as const };
    }

    const model = new QuickNoteModel(ctx.serverDB, ctx.userId, ctx.workspaceId ?? undefined);
    const run = await model.claimRun(input.id, { kind: 'discovery' });
    if (!run) throw new TRPCError({ code: 'NOT_FOUND', message: 'Quick Note not found' });

    await enqueueAgentSignalSourceEvent(
      {
        payload: {
          quickNoteId: run.quickNoteId,
          runId: run.id,
          sourceHistoryId: run.sourceHistoryId,
          userId: ctx.userId,
        },
        scopeKey: `quick-note:${run.quickNoteId}`,
        sourceId: run.id,
        sourceType: AGENT_SIGNAL_SOURCE_TYPES.quickNoteDiscoveryRequested,
      },
      {
        userId: ctx.userId,
        workspaceId: ctx.workspaceId ?? undefined,
      },
    );

    return { accepted: true as const, run };
  }),

  create: quickNoteWriteProcedure.input(createInput).mutation(async ({ ctx, input }) => {
    const model = new QuickNoteModel(ctx.serverDB, ctx.userId, ctx.workspaceId ?? undefined);
    return model.create(input);
  }),

  delete: quickNoteWriteProcedure.input(idInput).mutation(async ({ ctx, input }) => {
    const model = new QuickNoteModel(ctx.serverDB, ctx.userId, ctx.workspaceId ?? undefined);
    const deleted = await model.delete(input.id);
    if (!deleted) throw new TRPCError({ code: 'NOT_FOUND', message: 'Quick Note not found' });
    return { success: true };
  }),

  dive: quickNoteWriteProcedure.input(idInput).mutation(async ({ ctx, input }) => {
    const service = new QuickNoteProcessingService(
      ctx.serverDB,
      ctx.userId,
      ctx.workspaceId ?? undefined,
    );
    const run = await service.startDive(input.id);
    if (!run) throw new TRPCError({ code: 'NOT_FOUND', message: 'Quick Note not found' });
    return run;
  }),

  list: quickNoteProcedure.query(async ({ ctx }) => {
    const model = new QuickNoteModel(ctx.serverDB, ctx.userId, ctx.workspaceId ?? undefined);
    return model.queryDetails();
  }),

  updateContent: quickNoteWriteProcedure.input(updateInput).mutation(async ({ ctx, input }) => {
    const model = new QuickNoteModel(ctx.serverDB, ctx.userId, ctx.workspaceId ?? undefined);
    const automaticDiscoveryEnabled = await QuickNoteModel.isAutomaticDiscoveryEnabled(
      ctx.serverDB,
      ctx.userId,
    );
    const updated = await model.updateContent(input.id, {
      content: input.content,
      discoveryDueAt:
        automaticDiscoveryEnabled && input.content.trim() ? new Date(Date.now() + 30_000) : null,
      editorData: input.editorData,
    });
    if (!updated) throw new TRPCError({ code: 'NOT_FOUND', message: 'Quick Note not found' });
    return updated;
  }),
});
