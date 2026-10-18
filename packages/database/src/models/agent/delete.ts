import { TRPCError } from '@trpc/server';
import { and, eq, inArray } from 'drizzle-orm';

import { agents, agentsToSessions, sessions } from '../../schemas';
import type { LobeChatDatabase, Transaction } from '../../type';
import { AGENT_COPY_IN_PROGRESS, AgentCopyJobModel } from '../agentCopyJob';
import { AGENT_TRANSFER_IN_PROGRESS, AgentTransferJobModel } from '../agentTransferJob';
import { RESERVED_AGENT_SLUGS } from './constants';
import { type AgentModelContext } from './context';

/**
 * Delete an agent and its associated session.
 * This will cascade delete messages, topics, etc. through the session deletion.
 */
export const deleteAgent = async (ctx: AgentModelContext, agentId: string) => {
  return ctx.db.transaction(async (trx) => {
    // Lock the agent row BEFORE consulting the pending-copy guard — same
    // lock-then-guard order as transferAgents. A concurrent copy enqueue
    // locks the same source rows, so the guard here cannot run in the window
    // where the enqueue's job row exists but is not yet committed.
    const [locked] = await trx
      .select({ id: agents.id, slug: agents.slug })
      .from(agents)
      .where(and(eq(agents.id, agentId), ctx.ownership()))
      .for('update');

    // Builtins (the inbox, the agent builders) are provisioned per user and
    // carry `virtual` exactly like a group's own members. Deleting one takes
    // its linked session and every conversation with it, and nothing can
    // recreate them — refuse here, the same way `addAgentsToGroup` refuses to
    // seat one. This only guards callers of `AgentModel.delete`; paths that
    // delete `agents` rows directly (e.g. the OpenAPI `migrateSessionTo`
    // delete) bypass it.
    if (locked?.slug && RESERVED_AGENT_SLUGS.has(locked.slug)) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'A builtin agent cannot be deleted',
      });
    }

    // The junction records every agent an unfinished job still maps, a
    // copy's TARGET included — and a group copy's drain writes those ids into
    // `messages.agent_id`. Deleting one leaves the queue rows behind, so the
    // drain hits a missing-agent FK and retries forever, stranding the copied
    // conversations as pending. Distinct from the source guard below: a copy
    // registers only its target here.
    if (await AgentTransferJobModel.hasPendingJobForAgents(trx, [agentId])) {
      throw new Error(AGENT_TRANSFER_IN_PROGRESS);
    }

    // Not covered above: a group transfer that left this agent behind and
    // took a clone does NOT register it as a covered agent (it never moved).
    // But its id is still the live value of `messages.agent_id` on every
    // topic the drain has not reached yet, and that column cascades — so
    // deleting it now would destroy the moved group history the remap is
    // partway through rescuing.
    if (await AgentTransferJobModel.hasPendingRemapForSourceAgents(trx, [agentId])) {
      throw new Error(AGENT_TRANSFER_IN_PROGRESS);
    }

    // A pending copy job still reads this agent's topics — deleting it would
    // cascade them away and the copy would silently complete with empty
    // conversations. Surface the in-progress state instead.
    if (await AgentCopyJobModel.hasPendingCopyJobForSourceAgents(trx, [agentId])) {
      throw new Error(AGENT_COPY_IN_PROGRESS);
    }

    // 1. Get associated session IDs
    const links = await trx
      .select({ sessionId: agentsToSessions.sessionId })
      .from(agentsToSessions)
      .where(and(eq(agentsToSessions.agentId, agentId), ctx.agentsToSessionsOwnership()));

    const sessionIds = links.map((link) => link.sessionId);

    // 2. Delete links in agentsToSessions
    await trx
      .delete(agentsToSessions)
      .where(and(eq(agentsToSessions.agentId, agentId), ctx.agentsToSessionsOwnership()));

    // 3. Delete associated sessions (this will cascade delete messages, topics, etc.)
    if (sessionIds.length > 0) {
      await trx
        .delete(sessions)
        .where(and(inArray(sessions.id, sessionIds), ctx.sessionsOwnership()));
    }

    // 4. Delete the agent itself
    return trx.delete(agents).where(and(eq(agents.id, agentId), ctx.ownership()));
  });
};

// **************** Recycle bin *************** //

/**
 * Same pre-flight as {@link delete}: an agent whose history is mid-copy or
 * mid-transfer must not disappear from under the job. Runs the guards under
 * the same row lock so the check cannot race an enqueue. Throws
 * `AGENT_TRANSFER_IN_PROGRESS` / `AGENT_COPY_IN_PROGRESS`.
 */
export const assertDeletable = async (
  ctx: AgentModelContext,
  agentIds: string[],
  trx?: Transaction,
) => {
  if (agentIds.length === 0) return;
  const run = async (tx: Transaction | LobeChatDatabase) => {
    await tx
      .select({ id: agents.id })
      .from(agents)
      .where(and(inArray(agents.id, agentIds), ctx.trashScope()))
      .for('update');
    if (await AgentTransferJobModel.hasPendingJobForAgents(tx, agentIds)) {
      throw new Error(AGENT_TRANSFER_IN_PROGRESS);
    }
    if (await AgentTransferJobModel.hasPendingRemapForSourceAgents(tx, agentIds)) {
      throw new Error(AGENT_TRANSFER_IN_PROGRESS);
    }
    if (await AgentCopyJobModel.hasPendingCopyJobForSourceAgents(tx, agentIds)) {
      throw new Error(AGENT_COPY_IN_PROGRESS);
    }
  };
  return trx ? run(trx) : run(ctx.db);
};

/** Legacy session shells linked to the given agents (used to stamp `topics.session_id` rows). */
export const findSessionIdsByAgentIds = async (
  ctx: AgentModelContext,
  agentIds: string[],
): Promise<string[]> => {
  if (agentIds.length === 0) return [];
  const links = await ctx.db
    .select({ sessionId: agentsToSessions.sessionId })
    .from(agentsToSessions)
    .where(and(inArray(agentsToSessions.agentId, agentIds), ctx.agentsToSessionsOwnership()));
  return [...new Set(links.map((link) => link.sessionId))];
};

/** Agents linked to the given legacy session shells — the reverse of {@link findSessionIdsByAgentIds}. */
export const findAgentIdsBySessionIds = async (
  ctx: AgentModelContext,
  sessionIds: string[],
): Promise<string[]> => {
  if (sessionIds.length === 0) return [];
  const links = await ctx.db
    .select({ agentId: agentsToSessions.agentId })
    .from(agentsToSessions)
    .where(and(inArray(agentsToSessions.sessionId, sessionIds), ctx.agentsToSessionsOwnership()));
  return [...new Set(links.map((link) => link.agentId))];
};

/**
 * Batch delete agents by IDs.
 * This is a simpler delete that only removes the agent records.
 * Use this for virtual agents that don't have associated sessions.
 */
export const batchDelete = async (ctx: AgentModelContext, agentIds: string[]) => {
  if (agentIds.length === 0) return;

  return ctx.db.delete(agents).where(and(ctx.ownership(), inArray(agents.id, agentIds)));
};
