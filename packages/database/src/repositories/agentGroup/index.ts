import { AgentGroupDetail, AgentItem } from '@lobechat/types';
import { and, eq } from 'drizzle-orm';

import { agents, chatGroups, chatGroupsAgents } from '../../schemas';
import { LobeChatDatabase } from '../../type';

/**
 * Agent Group Repository - provides agent group detail data
 */
export class AgentGroupRepository {
  private userId: string;
  private db: LobeChatDatabase;

  constructor(db: LobeChatDatabase, userId: string) {
    this.userId = userId;
    this.db = db;
  }

  /**
   * Find a chat group by ID with its associated agents
   * @param groupId - The chat group ID
   * @returns AgentGroupDetail with group info and agents array, or null if not found
   */
  async findByIdWithAgents(groupId: string): Promise<AgentGroupDetail | null> {
    // 1. Find the group
    const group = await this.db.query.chatGroups.findFirst({
      where: and(eq(chatGroups.id, groupId), eq(chatGroups.userId, this.userId)),
    });

    if (!group) return null;

    // 2. Find all agents associated with this group
    const groupAgentsWithDetails = await this.db
      .select({
        agent: agents,
        order: chatGroupsAgents.order,
      })
      .from(chatGroupsAgents)
      .innerJoin(agents, eq(chatGroupsAgents.agentId, agents.id))
      .where(eq(chatGroupsAgents.chatGroupId, groupId))
      .orderBy(chatGroupsAgents.order);

    // 3. Extract agent items and cast to AgentItem type
    const agentItems = groupAgentsWithDetails.map((row) => row.agent as AgentItem);

    return {
      ...group,
      agents: agentItems,
    } as AgentGroupDetail;
  }
}
