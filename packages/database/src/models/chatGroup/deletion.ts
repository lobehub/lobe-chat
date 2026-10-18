import { and, eq, inArray, isNull, notInArray, or } from 'drizzle-orm';

import type { ChatGroupItem } from '../../schemas';
import { agents, chatGroups, chatGroupsAgents } from '../../schemas';
import type { LobeChatDatabase } from '../../type';
import { isOwnedMembership } from '../../utils/groupMembership';
import { RESERVED_BUILTIN_AGENT_SLUGS } from './constants';
import { type ChatGroupContext, groupOwnership } from './scope';

/**
 * Agent ids that die with the given groups.
 *
 * `agents` has NO foreign key to `chat_groups` — the cascade only reaches the
 * junction — so deleting a group leaves its synthetic supervisor and its
 * group-built members behind forever: `virtual: true` hides them from every
 * list, so nothing will ever surface or reclaim them.
 *
 * Read from the RAW junction rows, with no visibility or ownership predicate
 * on the member agent. Those predicates belong to reads: a member another
 * workspace user flipped back to `private` is still owned by this group, and
 * filtering it out here is precisely how the previous service-level cleanup
 * leaked. The caller has already proven it may delete the group itself.
 */
const findOwnedMemberAgentIds = async (
  executor: LobeChatDatabase,
  groupIds: string[],
): Promise<string[]> => {
  if (groupIds.length === 0) return [];

  const rows = await executor
    .select({ agentId: chatGroupsAgents.agentId })
    .from(chatGroupsAgents)
    .innerJoin(agents, eq(chatGroupsAgents.agentId, agents.id))
    .where(and(inArray(chatGroupsAgents.chatGroupId, groupIds), isOwnedMembership()));

  return [...new Set(rows.map((row) => row.agentId))];
};

/**
 * Builtin agents (Inbox, the agent builders, …) are provisioned per user and
 * are `virtual` like a group's own members, so `owned` on a malformed
 * junction row would be enough to take one down with a group. Their reserved
 * slugs are the one thing that always tells them apart — a cheap belt to the
 * `owned` braces, on a delete whose blast radius is somebody's Inbox.
 */
const deleteOwnedMemberAgents = async (
  executor: LobeChatDatabase,
  agentIds: string[],
): Promise<string[]> => {
  if (agentIds.length === 0) return [];

  const deleted = await executor
    .delete(agents)
    .where(
      and(
        inArray(agents.id, agentIds),
        eq(agents.virtual, true),
        // A NULL slug predates slug generation and is not a builtin;
        // `NOT IN` alone would evaluate to NULL and skip those rows.
        or(isNull(agents.slug), notInArray(agents.slug, RESERVED_BUILTIN_AGENT_SLUGS)),
      ),
    )
    .returning({ id: agents.id });

  return deleted.map((row) => row.id);
};

/**
 * Delete a group together with the agents that only existed to serve it.
 *
 * Returns the deleted owned-agent ids so callers can report them; the delete
 * itself needs no follow-up.
 */
export const deleteGroup = async (
  ctx: ChatGroupContext,
  id: string,
): Promise<{ deletedOwnedAgentIds: string[]; group: ChatGroupItem }> => {
  return ctx.db.transaction(async (trx) => {
    // Collect BEFORE the delete: the junction rows cascade away with the
    // group, taking the only record of which agents were group-owned.
    const ownedAgentIds = await findOwnedMemberAgentIds(trx, [id]);

    const [result] = await trx
      .delete(chatGroups)
      .where(and(eq(chatGroups.id, id), groupOwnership(ctx)))
      .returning();

    if (!result) {
      throw new Error('Chat group not found or access denied');
    }

    // Same transaction as the group delete: a cleanup that can be interrupted
    // between the two statements is a leak with extra steps.
    const deletedOwnedAgentIds = await deleteOwnedMemberAgents(trx, ownedAgentIds);

    return { deletedOwnedAgentIds, group: result };
  });
};

export const deleteAllGroups = async (ctx: ChatGroupContext): Promise<void> => {
  await ctx.db.transaction(async (trx) => {
    const groupIds = await trx
      .select({ id: chatGroups.id })
      .from(chatGroups)
      .where(groupOwnership(ctx));

    const ownedAgentIds = await findOwnedMemberAgentIds(
      trx,
      groupIds.map((group) => group.id),
    );

    await trx.delete(chatGroups).where(groupOwnership(ctx));

    await deleteOwnedMemberAgents(trx, ownedAgentIds);
  });
};
