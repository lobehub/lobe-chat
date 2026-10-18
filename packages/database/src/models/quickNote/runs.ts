import type { QuickNoteRunError, QuickNoteRunExecutionConfig } from '@lobechat/types';
import { and, asc, desc, eq, inArray, isNull, sql } from 'drizzle-orm';

import {
  documentHistories,
  documents,
  quickNoteCommentRevisions,
  quickNoteComments,
  quickNoteProposals,
  quickNoteRunInputs,
  quickNoteRuns,
  quickNotes,
} from '../../schemas';
import { type QuickNoteContext, quickNoteOwnershipWhere } from './context';
import type { ClaimQuickNoteRunParams } from './types';

export const claimRun = async (
  ctx: QuickNoteContext,
  id: string,
  params: ClaimQuickNoteRunParams,
) =>
  ctx.db.transaction(async (tx) => {
    const [quickNote] = await tx
      .select({
        documentId: quickNotes.documentId,
        editorData: documents.editorData,
        id: quickNotes.id,
      })
      .from(quickNotes)
      .innerJoin(documents, eq(documents.id, quickNotes.documentId))
      .where(and(eq(quickNotes.id, id), quickNoteOwnershipWhere(ctx)));

    if (!quickNote) return undefined;

    const [activeRun] = await tx
      .select()
      .from(quickNoteRuns)
      .where(
        and(
          eq(quickNoteRuns.quickNoteId, id),
          eq(quickNoteRuns.kind, params.kind),
          inArray(quickNoteRuns.status, ['pending', 'running']),
        ),
      )
      .limit(1);

    if (activeRun) return activeRun;

    const [history] = await tx
      .insert(documentHistories)
      .values({
        documentId: quickNote.documentId,
        editorData: quickNote.editorData ?? { root: { children: [] } },
        saveSource: 'system',
        savedAt: new Date(),
        userId: ctx.userId,
        workspaceId: ctx.workspaceId,
      })
      .returning();

    const [run] = await tx
      .insert(quickNoteRuns)
      .values({
        kind: params.kind,
        quickNoteId: quickNote.id,
        sourceHistoryId: history.id,
        trigger: params.trigger,
      })
      .onConflictDoNothing({
        target: [quickNoteRuns.quickNoteId, quickNoteRuns.kind],
        where: sql`${quickNoteRuns.status} IN ('pending', 'running')`,
      })
      .returning();

    if (run) {
      const commentRevisions = await tx
        .select({
          commentId: quickNoteComments.id,
          revisionId: quickNoteCommentRevisions.id,
        })
        .from(quickNoteComments)
        .innerJoin(
          quickNoteCommentRevisions,
          eq(quickNoteCommentRevisions.commentId, quickNoteComments.id),
        )
        .where(eq(quickNoteComments.quickNoteId, quickNote.id))
        .orderBy(desc(quickNoteCommentRevisions.createdAt), desc(quickNoteCommentRevisions.id));
      const latestCommentRevisionIds = new Map<string, string>();
      for (const revision of commentRevisions) {
        if (!latestCommentRevisionIds.has(revision.commentId)) {
          latestCommentRevisionIds.set(revision.commentId, revision.revisionId);
        }
      }

      const proposalHistories = await tx
        .select({ historyId: quickNoteProposals.currentHistoryId })
        .from(quickNoteProposals)
        .where(
          and(
            eq(quickNoteProposals.quickNoteId, quickNote.id),
            eq(quickNoteProposals.decisionStatus, 'pending'),
          ),
        )
        .orderBy(asc(quickNoteProposals.id))
        // Keep the current revision referenced until its immutable input pin is committed.
        .for('update');

      await tx.insert(quickNoteRunInputs).values([
        {
          documentHistoryId: history.id,
          role: 'source',
          runId: run.id,
          userId: ctx.userId,
          workspaceId: ctx.workspaceId,
        },
        ...[...latestCommentRevisionIds.values()].map((commentRevisionId) => ({
          commentRevisionId,
          role: 'comment' as const,
          runId: run.id,
          userId: ctx.userId,
          workspaceId: ctx.workspaceId,
        })),
        ...proposalHistories.map(({ historyId: documentHistoryId }) => ({
          documentHistoryId,
          role: 'proposal' as const,
          runId: run.id,
          userId: ctx.userId,
          workspaceId: ctx.workspaceId,
        })),
      ]);

      return run;
    }

    // A concurrent claimant won the partial unique index after this transaction
    // created its snapshot. Remove the unused snapshot, then return that winner.
    await tx.delete(documentHistories).where(eq(documentHistories.id, history.id));
    const [winner] = await tx
      .select()
      .from(quickNoteRuns)
      .where(
        and(
          eq(quickNoteRuns.quickNoteId, id),
          eq(quickNoteRuns.kind, params.kind),
          inArray(quickNoteRuns.status, ['pending', 'running']),
        ),
      )
      .limit(1);

    return winner;
  });

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
