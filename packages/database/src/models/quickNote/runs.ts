import type { QuickNoteRunError, QuickNoteRunExecutionConfig } from '@lobechat/types';
import { and, asc, desc, eq, inArray, isNull, sql } from 'drizzle-orm';
import isEqual from 'fast-deep-equal';

import {
  documentHistories,
  quickNoteCommentRevisions,
  quickNoteComments,
  quickNoteProposals,
  quickNoteRunInputs,
  quickNoteRuns,
  quickNotes,
} from '../../schemas';
import { ownedQuickNoteIds, type QuickNoteContext, quickNoteOwnershipWhere } from './context';
import type { ClaimQuickNoteRunParams } from './types';

/** The pending or running Run of one kind for a Quick Note, if any. */
export const findActiveRun = async (
  ctx: QuickNoteContext,
  quickNoteId: string,
  kind: ClaimQuickNoteRunParams['kind'],
) => {
  const [run] = await ctx.db
    .select()
    .from(quickNoteRuns)
    .where(
      and(
        eq(quickNoteRuns.quickNoteId, quickNoteId),
        eq(quickNoteRuns.kind, kind),
        inArray(quickNoteRuns.status, ['pending', 'running']),
      ),
    )
    .limit(1);

  return run;
};

/**
 * Inserts a pending Run against a pinned source revision.
 *
 * Returns `undefined` when a concurrent claimant already holds the active Run of this kind
 * (partial unique index on pending/running Runs).
 */
export const insertPendingRun = async (
  ctx: QuickNoteContext,
  quickNoteId: string,
  sourceHistoryId: string,
  params: ClaimQuickNoteRunParams,
) => {
  const [run] = await ctx.db
    .insert(quickNoteRuns)
    .values({
      kind: params.kind,
      quickNoteId,
      sourceHistoryId,
      trigger: params.trigger,
    })
    .onConflictDoNothing({
      target: [quickNoteRuns.quickNoteId, quickNoteRuns.kind],
      where: sql`${quickNoteRuns.status} IN ('pending', 'running')`,
    })
    .returning();

  return run;
};

/**
 * Pins the source revision, latest Comment revisions, and pending Proposal revisions as Run Inputs.
 *
 * Expects:
 * - Runs inside the claiming transaction: pending Proposal rows are locked in id order so a
 *   concurrent Proposal edit cannot advance (and retention cannot drop) an observed revision
 *   before its input pin commits.
 */
export const pinRunInputs = async (
  ctx: QuickNoteContext,
  runId: string,
  quickNoteId: string,
  sourceHistoryId: string,
) => {
  const commentRevisions = await ctx.db
    .select({
      commentId: quickNoteComments.id,
      revisionId: quickNoteCommentRevisions.id,
    })
    .from(quickNoteComments)
    .innerJoin(
      quickNoteCommentRevisions,
      eq(quickNoteCommentRevisions.commentId, quickNoteComments.id),
    )
    .where(eq(quickNoteComments.quickNoteId, quickNoteId))
    .orderBy(desc(quickNoteCommentRevisions.createdAt), desc(quickNoteCommentRevisions.id));
  const latestCommentRevisionIds = new Map<string, string>();
  for (const revision of commentRevisions) {
    if (!latestCommentRevisionIds.has(revision.commentId)) {
      latestCommentRevisionIds.set(revision.commentId, revision.revisionId);
    }
  }

  const proposalHistories = await ctx.db
    .select({ historyId: quickNoteProposals.currentHistoryId })
    .from(quickNoteProposals)
    .where(
      and(
        eq(quickNoteProposals.quickNoteId, quickNoteId),
        eq(quickNoteProposals.decisionStatus, 'pending'),
      ),
    )
    .orderBy(asc(quickNoteProposals.id))
    // Keep the current revision referenced until its immutable input pin is committed.
    .for('update');

  await ctx.db.insert(quickNoteRunInputs).values([
    {
      documentHistoryId: sourceHistoryId,
      role: 'source',
      runId,
      userId: ctx.userId,
      workspaceId: ctx.workspaceId,
    },
    ...[...latestCommentRevisionIds.values()].map((commentRevisionId) => ({
      commentRevisionId,
      role: 'comment' as const,
      runId,
      userId: ctx.userId,
      workspaceId: ctx.workspaceId,
    })),
    ...proposalHistories.map(({ historyId: documentHistoryId }) => ({
      documentHistoryId,
      role: 'proposal' as const,
      runId,
      userId: ctx.userId,
      workspaceId: ctx.workspaceId,
    })),
  ]);
};

/**
 * Completes a Run whose Annotation was accepted and refreshes the parent Quick Note metadata.
 *
 * Expects:
 * - `run` is the snapshot read by {@link findRunForAnnotation} in the same transaction.
 * - A stale Run (source edited since its snapshot) keeps the Quick Note's due time and tags.
 */
export const completeAnnotationRun = async (
  ctx: QuickNoteContext,
  runId: string,
  run: {
    analyzeDueAt: Date | null;
    quickNoteId: string;
    sourceDocumentEditorData: unknown;
    sourceHistoryEditorData: unknown;
    tags: string[];
  },
  tags?: string[],
) => {
  await ctx.db
    .update(quickNoteRuns)
    .set({ completedAt: new Date(), status: 'completed', updatedAt: new Date() })
    .where(
      and(eq(quickNoteRuns.id, runId), inArray(quickNoteRuns.quickNoteId, ownedQuickNoteIds(ctx))),
    );

  const sourceIsCurrent = isEqual(run.sourceDocumentEditorData, run.sourceHistoryEditorData);
  await ctx.db
    .update(quickNotes)
    .set({
      analyzeDueAt: sourceIsCurrent ? null : run.analyzeDueAt,
      // A stale Run remains auditable, but its interpretation must not mutate current metadata.
      tags: sourceIsCurrent && tags ? [...new Set([...run.tags, ...tags])] : run.tags,
      updatedAt: new Date(),
    })
    .where(and(eq(quickNotes.id, run.quickNoteId), quickNoteOwnershipWhere(ctx)));
};

export const attachThread = async (ctx: QuickNoteContext, runId: string, threadId: string) => {
  const [run] = await ctx.db
    .update(quickNoteRuns)
    .set({ threadId, updatedAt: new Date() })
    .where(
      and(
        eq(quickNoteRuns.id, runId),
        eq(quickNoteRuns.status, 'pending'),
        inArray(
          quickNoteRuns.quickNoteId,
          ctx.db.select({ id: quickNotes.id }).from(quickNotes).where(quickNoteOwnershipWhere(ctx)),
        ),
      ),
    )
    .returning();

  return run;
};

export const attachOperation = async (
  ctx: QuickNoteContext,
  runId: string,
  params: {
    agentId: string;
    executionConfig: QuickNoteRunExecutionConfig;
    operationId: string;
    threadId?: string;
  },
) => {
  const [run] = await ctx.db
    .update(quickNoteRuns)
    .set({
      agentId: params.agentId,
      executionConfig: params.executionConfig,
      operationId: params.operationId,
      startedAt: new Date(),
      status: 'running',
      threadId: params.threadId,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(quickNoteRuns.id, runId),
        eq(quickNoteRuns.status, 'pending'),
        inArray(
          quickNoteRuns.quickNoteId,
          ctx.db.select({ id: quickNotes.id }).from(quickNotes).where(quickNoteOwnershipWhere(ctx)),
        ),
      ),
    )
    .returning();

  return run;
};

export const failRun = async (
  ctx: QuickNoteContext,
  runId: string,
  error: QuickNoteRunError,
  options?: {
    /** Only release claims before dispatch has attached a thread or operation. @default false */
    onlyUndispatched?: boolean;
  },
) => {
  const [run] = await ctx.db
    .update(quickNoteRuns)
    .set({ completedAt: new Date(), error, status: 'failed', updatedAt: new Date() })
    .where(
      and(
        eq(quickNoteRuns.id, runId),
        options?.onlyUndispatched
          ? and(
              eq(quickNoteRuns.status, 'pending'),
              isNull(quickNoteRuns.threadId),
              isNull(quickNoteRuns.operationId),
            )
          : inArray(quickNoteRuns.status, ['pending', 'running']),
        inArray(
          quickNoteRuns.quickNoteId,
          ctx.db.select({ id: quickNotes.id }).from(quickNotes).where(quickNoteOwnershipWhere(ctx)),
        ),
      ),
    )
    .returning();

  return run;
};

export const getRunContext = async (ctx: QuickNoteContext, runId: string) => {
  const [result] = await ctx.db
    .select({
      kind: quickNoteRuns.kind,
      operationId: quickNoteRuns.operationId,
      quickNoteId: quickNoteRuns.quickNoteId,
      sourceDocumentId: quickNotes.documentId,
      sourceEditorData: documentHistories.editorData,
      sourceHistoryId: quickNoteRuns.sourceHistoryId,
      status: quickNoteRuns.status,
      threadId: quickNoteRuns.threadId,
      topicId: quickNotes.topicId,
      trigger: quickNoteRuns.trigger,
    })
    .from(quickNoteRuns)
    .innerJoin(quickNotes, eq(quickNotes.id, quickNoteRuns.quickNoteId))
    .innerJoin(documentHistories, eq(documentHistories.id, quickNoteRuns.sourceHistoryId))
    .where(and(eq(quickNoteRuns.id, runId), quickNoteOwnershipWhere(ctx)));

  if (!result) return undefined;

  const inputs = await ctx.db
    .select({
      commentContent: quickNoteCommentRevisions.content,
      commentEditorData: quickNoteCommentRevisions.editorData,
      commentRevisionId: quickNoteRunInputs.commentRevisionId,
      documentEditorData: documentHistories.editorData,
      documentHistoryId: quickNoteRunInputs.documentHistoryId,
      role: quickNoteRunInputs.role,
    })
    .from(quickNoteRunInputs)
    .leftJoin(documentHistories, eq(documentHistories.id, quickNoteRunInputs.documentHistoryId))
    .leftJoin(
      quickNoteCommentRevisions,
      eq(quickNoteCommentRevisions.id, quickNoteRunInputs.commentRevisionId),
    )
    .where(eq(quickNoteRunInputs.runId, runId))
    .orderBy(quickNoteRunInputs.createdAt, quickNoteRunInputs.id);

  return { ...result, inputs };
};
