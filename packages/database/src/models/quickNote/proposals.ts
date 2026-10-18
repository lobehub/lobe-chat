import type { QuickNoteProposalDecisionStatus } from '@lobechat/types';
import { and, desc, eq, inArray, sql } from 'drizzle-orm';

import type { NewQuickNoteProposal } from '../../schemas';
import {
  documents,
  quickNoteProposals,
  quickNoteResources,
  quickNoteRunResources,
  quickNotes,
} from '../../schemas';
import { ownedQuickNoteIds, type QuickNoteContext, quickNoteOwnershipWhere } from './context';

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

/** Reads an owned Proposal's edit state, or `undefined` when inaccessible. */
export const findProposalForEdit = async (ctx: QuickNoteContext, proposalId: string) => {
  const [proposal] = await ctx.db
    .select({
      decisionStatus: quickNoteProposals.decisionStatus,
      documentId: quickNoteProposals.documentId,
      id: quickNoteProposals.id,
    })
    .from(quickNoteProposals)
    .innerJoin(quickNotes, eq(quickNotes.id, quickNoteProposals.quickNoteId))
    .where(and(eq(quickNoteProposals.id, proposalId), quickNoteOwnershipWhere(ctx)));

  return proposal;
};

/** Advances a Proposal's current revision pointer after its Document body was edited. */
export const setProposalCurrentHistory = async (
  ctx: QuickNoteContext,
  proposalId: string,
  currentHistoryId: string,
  updatedAt: Date,
) => {
  const [proposal] = await ctx.db
    .update(quickNoteProposals)
    .set({ currentHistoryId, updatedAt })
    .where(
      and(
        eq(quickNoteProposals.id, proposalId),
        inArray(quickNoteProposals.quickNoteId, ownedQuickNoteIds(ctx)),
      ),
    )
    .returning();

  return proposal;
};

/** Persists one inert Proposal produced by an accepted Run. */
export const createProposal = async (
  ctx: QuickNoteContext,
  params: {
    currentHistoryId: string;
    documentId: string;
    kind: NewQuickNoteProposal['kind'];
    quickNoteId: string;
    runId: string;
    sourceHistoryId: string;
  },
) => {
  const [proposal] = await ctx.db
    .insert(quickNoteProposals)
    .values({ ...params, userId: ctx.userId, workspaceId: ctx.workspaceId })
    .returning();

  return proposal;
};

/** Marks current pending Proposals stale after their Quick Note source changed. */
export const markPendingProposalsStale = async (
  ctx: QuickNoteContext,
  quickNoteId: string,
  updatedAt: Date,
) => {
  await ctx.db
    .update(quickNoteProposals)
    .set({ updatedAt, validity: 'stale' })
    .where(
      and(
        eq(quickNoteProposals.quickNoteId, quickNoteId),
        inArray(quickNoteProposals.quickNoteId, ownedQuickNoteIds(ctx)),
        eq(quickNoteProposals.decisionStatus, 'pending'),
        eq(quickNoteProposals.validity, 'current'),
      ),
    );
};

/**
 * Locks an owned, pending, current Proposal with its Document body for Task conversion.
 *
 * Returns:
 * - The locked Proposal, or `undefined` when inaccessible, decided, or stale.
 */
export const lockAcceptableProposal = async (ctx: QuickNoteContext, proposalId: string) => {
  const [proposal] = await ctx.db
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

  return proposal;
};

/**
 * Accepts a locked Task Proposal and links the created Task as Run-produced Context.
 *
 * Expects:
 * - `proposal` came from {@link lockAcceptableProposal} in the same transaction.
 *
 * Returns:
 * - The terminally accepted Proposal.
 */
export const recordTaskProposalAcceptance = async (
  ctx: QuickNoteContext,
  proposal: {
    currentHistoryId: string;
    id: string;
    quickNoteId: string;
    runId: string;
    sourceHistoryId: string;
  },
  taskId: string,
) => {
  const [acceptedProposal] = await ctx.db
    .update(quickNoteProposals)
    .set({
      acceptedHistoryId: proposal.currentHistoryId,
      decisionStatus: 'accepted',
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(quickNoteProposals.id, proposal.id),
        inArray(quickNoteProposals.quickNoteId, ownedQuickNoteIds(ctx)),
      ),
    )
    .returning();
  // The links below attach to the Proposal's Quick Note, so stop unless the owned update matched.
  if (!acceptedProposal) return undefined;

  const [createdResource] = await ctx.db
    .insert(quickNoteResources)
    .values({
      quickNoteId: proposal.quickNoteId,
      resourceId: taskId,
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
      await ctx.db
        .select()
        .from(quickNoteResources)
        .where(
          and(
            eq(quickNoteResources.quickNoteId, proposal.quickNoteId),
            eq(quickNoteResources.sourceHistoryId, proposal.sourceHistoryId),
            eq(quickNoteResources.resourceId, taskId),
            eq(quickNoteResources.resourceType, 'task'),
            eq(quickNoteResources.role, 'context'),
          ),
        )
    )[0];
  if (resource) {
    await ctx.db
      .insert(quickNoteRunResources)
      .values({
        resourceId: resource.id,
        runId: proposal.runId,
        userId: ctx.userId,
        workspaceId: ctx.workspaceId,
      })
      .onConflictDoNothing();
  }

  return acceptedProposal;
};

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
