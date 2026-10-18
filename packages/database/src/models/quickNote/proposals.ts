import type { QuickNoteProposalDecisionStatus } from '@lobechat/types';
import { and, desc, eq, inArray, sql } from 'drizzle-orm';

import {
  documentHistories,
  documents,
  quickNoteProposals,
  quickNoteResources,
  quickNoteRunResources,
  quickNotes,
} from '../../schemas';
import { TaskModel } from '../task';
import { type QuickNoteContext, quickNoteOwnershipWhere } from './context';
import type { UpdateQuickNoteProposalParams } from './types';

export const queryProposals = async (ctx: QuickNoteContext, quickNoteId: string) =>
  ctx.db
    .select({
      acceptedHistoryId: quickNoteProposals.acceptedHistoryId,
      content: documents.content,
      createdAt: quickNoteProposals.createdAt,
      currentHistoryId: quickNoteProposals.currentHistoryId,
      decisionStatus: quickNoteProposals.decisionStatus,
      documentId: quickNoteProposals.documentId,
      editorData: documents.editorData,
      id: quickNoteProposals.id,
      kind: quickNoteProposals.kind,
      runId: quickNoteProposals.runId,
      sourceHistoryId: quickNoteProposals.sourceHistoryId,
      updatedAt: quickNoteProposals.updatedAt,
      validity: quickNoteProposals.validity,
    })
    .from(quickNoteProposals)
    .innerJoin(quickNotes, eq(quickNotes.id, quickNoteProposals.quickNoteId))
    .innerJoin(documents, eq(documents.id, quickNoteProposals.documentId))
    .where(and(eq(quickNoteProposals.quickNoteId, quickNoteId), quickNoteOwnershipWhere(ctx)))
    .orderBy(desc(quickNoteProposals.createdAt), desc(quickNoteProposals.id));

export const updateProposal = async (
  ctx: QuickNoteContext,
  proposalId: string,
  params: UpdateQuickNoteProposalParams,
) =>
  ctx.db.transaction(async (tx) => {
    const [proposal] = await tx
      .select({
        decisionStatus: quickNoteProposals.decisionStatus,
        documentId: quickNoteProposals.documentId,
        id: quickNoteProposals.id,
      })
      .from(quickNoteProposals)
      .innerJoin(quickNotes, eq(quickNotes.id, quickNoteProposals.quickNoteId))
      .where(and(eq(quickNoteProposals.id, proposalId), quickNoteOwnershipWhere(ctx)));
    if (!proposal || proposal.decisionStatus !== 'pending') return undefined;

    const savedAt = new Date();
    await tx
      .update(documents)
      .set({
        content: params.content,
        editorData: params.editorData,
        totalCharCount: params.content.length,
        totalLineCount: params.content.length === 0 ? 0 : params.content.split('\n').length,
        updatedAt: savedAt,
      })
      .where(eq(documents.id, proposal.documentId));
    const [history] = await tx
      .insert(documentHistories)
      .values({
        documentId: proposal.documentId,
        editorData: params.editorData,
        saveSource: 'manual',
        savedAt,
        userId: ctx.userId,
        workspaceId: ctx.workspaceId,
      })
      .returning();
    const [updated] = await tx
      .update(quickNoteProposals)
      .set({ currentHistoryId: history.id, updatedAt: savedAt })
      .where(eq(quickNoteProposals.id, proposal.id))
      .returning();

    return { history, proposal: updated };
  });

export const acceptTaskProposal = async (ctx: QuickNoteContext, proposalId: string) =>
  ctx.db.transaction(async (tx) => {
    const [proposal] = await tx
      .select({
        content: documents.content,
        currentHistoryId: quickNoteProposals.currentHistoryId,
        id: quickNoteProposals.id,
        kind: quickNoteProposals.kind,
        quickNoteId: quickNoteProposals.quickNoteId,
        runId: quickNoteProposals.runId,
        sourceHistoryId: quickNoteProposals.sourceHistoryId,
      })
      .from(quickNoteProposals)
      .innerJoin(quickNotes, eq(quickNotes.id, quickNoteProposals.quickNoteId))
      .innerJoin(documents, eq(documents.id, quickNoteProposals.documentId))
      .where(
        and(
          eq(quickNoteProposals.id, proposalId),
          eq(quickNoteProposals.decisionStatus, 'pending'),
          eq(quickNoteProposals.validity, 'current'),
          quickNoteOwnershipWhere(ctx),
        ),
      )
      .for('update');
    if (!proposal || proposal.kind !== 'task' || !proposal.content?.trim()) return undefined;

    // Quick Notes are private captures, so an explicitly converted Task starts private too.
    const task = await new TaskModel(tx, ctx.userId, ctx.workspaceId).create(
      { instruction: proposal.content, visibility: 'private' },
      { maxRetries: 1 },
    );
    const [acceptedProposal] = await tx
      .update(quickNoteProposals)
      .set({
        acceptedHistoryId: proposal.currentHistoryId,
        decisionStatus: 'accepted',
        updatedAt: new Date(),
      })
      .where(eq(quickNoteProposals.id, proposal.id))
      .returning();

    const [createdResource] = await tx
      .insert(quickNoteResources)
      .values({
        quickNoteId: proposal.quickNoteId,
        resourceId: task.id,
        resourceType: 'task',
        role: 'context',
        sourceHistoryId: proposal.sourceHistoryId,
        userId: ctx.userId,
        workspaceId: ctx.workspaceId,
      })
      .onConflictDoNothing()
      .returning();
    const resource =
      createdResource ??
      (
        await tx
          .select()
          .from(quickNoteResources)
          .where(
            and(
              eq(quickNoteResources.quickNoteId, proposal.quickNoteId),
              eq(quickNoteResources.sourceHistoryId, proposal.sourceHistoryId),
              eq(quickNoteResources.resourceId, task.id),
              eq(quickNoteResources.resourceType, 'task'),
              eq(quickNoteResources.role, 'context'),
            ),
          )
      )[0];
    if (resource) {
      await tx
        .insert(quickNoteRunResources)
        .values({
          resourceId: resource.id,
          runId: proposal.runId,
          userId: ctx.userId,
          workspaceId: ctx.workspaceId,
        })
        .onConflictDoNothing();
    }

    return { proposal: acceptedProposal, task };
  });

export const decideProposal = async (
  ctx: QuickNoteContext,
  proposalId: string,
  decisionStatus: Exclude<QuickNoteProposalDecisionStatus, 'pending'>,
) => {
  const [proposal] = await ctx.db
    .update(quickNoteProposals)
    .set({
      acceptedHistoryId:
        decisionStatus === 'accepted' ? sql`${quickNoteProposals.currentHistoryId}` : null,
      decisionStatus,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(quickNoteProposals.id, proposalId),
        eq(quickNoteProposals.decisionStatus, 'pending'),
        inArray(
          quickNoteProposals.quickNoteId,
          ctx.db.select({ id: quickNotes.id }).from(quickNotes).where(quickNoteOwnershipWhere(ctx)),
        ),
      ),
    )
    .returning();

  return proposal;
};
