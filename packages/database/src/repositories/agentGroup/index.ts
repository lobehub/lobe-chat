import { AgentGroupDetail, AgentGroupMember } from '@lobechat/types';
import { and, eq } from 'drizzle-orm';

import {
  ChatGroupItem,
  NewChatGroup,
  NewChatGroupAgent,
  agents,
  chatGroups,
  chatGroupsAgents,
} from '../../schemas';
import { LobeChatDatabase } from '../../type';
import { ChatGroupConfig } from '../../types/chatGroup';

export interface SupervisorAgentConfig {
  model?: string;
  provider?: string;
  title?: string;
}

export interface CreateGroupWithSupervisorResult {
  agents: NewChatGroupAgent[];
  group: ChatGroupItem;
  supervisorAgentId: string;
}

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
   * Find a chat group by ID with its associated agents.
   * If no supervisor exists, a virtual supervisor agent is automatically created.
   * @param groupId - The chat group ID
   * @returns AgentGroupDetail with group info, agents array, and supervisor agent ID
   */
  async findByIdWithAgents(groupId: string): Promise<AgentGroupDetail | null> {
    // 1. Find the group
    const group = await this.db.query.chatGroups.findFirst({
      where: and(eq(chatGroups.id, groupId), eq(chatGroups.userId, this.userId)),
    });

    if (!group) return null;

    // 2. Find all agents associated with this group (including role info)
    const groupAgentsWithDetails = await this.db
      .select({
        agent: agents,
        order: chatGroupsAgents.order,
        role: chatGroupsAgents.role,
      })
      .from(chatGroupsAgents)
      .innerJoin(agents, eq(chatGroupsAgents.agentId, agents.id))
      .where(eq(chatGroupsAgents.chatGroupId, groupId))
      .orderBy(chatGroupsAgents.order);

    // 3. Extract agent items with isSupervisor flag and find supervisor
    const agentItems: AgentGroupMember[] = [];
    let supervisorAgentId: string | undefined;

    for (const row of groupAgentsWithDetails) {
      const isSupervisor = row.role === 'supervisor';
      agentItems.push({
        ...row.agent,
        isSupervisor,
      } as AgentGroupMember);
      if (isSupervisor) {
        supervisorAgentId = row.agent.id;
      }
    }

    // 4. If no supervisor exists, create a virtual supervisor agent
    if (!supervisorAgentId) {
      const groupConfig = group.config as ChatGroupConfig | undefined;

      // Create supervisor agent (virtual agent)
      const [supervisorAgent] = await this.db
        .insert(agents)
        .values({
          model: groupConfig?.orchestratorModel,
          provider: groupConfig?.orchestratorProvider,
          title: 'Supervisor',
          userId: this.userId,
          virtual: true,
        })
        .returning();

      // Add supervisor agent to group with role 'supervisor'
      await this.db.insert(chatGroupsAgents).values({
        agentId: supervisorAgent.id,
        chatGroupId: group.id,
        order: -1, // Supervisor always first (negative order)
        role: 'supervisor',
        userId: this.userId,
      });

      supervisorAgentId = supervisorAgent.id;

      // Insert at the beginning of agents array
      agentItems.unshift({
        ...supervisorAgent,
        isSupervisor: true,
      } as AgentGroupMember);
    }

    return {
      ...group,
      agents: agentItems,
      supervisorAgentId,
    } as AgentGroupDetail;
  }

  /**
   * Create a chat group with a supervisor agent and optional member agents.
   * The supervisor agent is automatically created as a virtual agent with role 'supervisor'.
   *
   * @param groupParams - Parameters for creating the chat group
   * @param agentMembers - Array of existing agent IDs to add as members (optional)
   * @param supervisorConfig - Optional configuration for the supervisor agent
   * @returns Created group, agents, and supervisor agent ID
   */
  async createGroupWithSupervisor(
    groupParams: Omit<NewChatGroup, 'userId'>,
    agentMembers: string[] = [],
    supervisorConfig?: SupervisorAgentConfig,
  ): Promise<CreateGroupWithSupervisorResult> {
    const groupConfig = groupParams.config as ChatGroupConfig | undefined;

    // 1. Create supervisor agent (virtual agent)
    const [supervisorAgent] = await this.db
      .insert(agents)
      .values({
        model: supervisorConfig?.model ?? groupConfig?.orchestratorModel,
        provider: supervisorConfig?.provider ?? groupConfig?.orchestratorProvider,
        title: supervisorConfig?.title ?? 'Supervisor',
        userId: this.userId,
        virtual: true,
      })
      .returning();

    // 2. Create the group
    const [group] = await this.db
      .insert(chatGroups)
      .values({ ...groupParams, userId: this.userId })
      .returning();

    // 3. Add supervisor agent to group with role 'supervisor'
    const supervisorGroupAgent: NewChatGroupAgent = {
      agentId: supervisorAgent.id,
      chatGroupId: group.id,
      order: -1, // Supervisor always first (negative order)
      role: 'supervisor',
      userId: this.userId,
    };

    // 4. Add member agents to group with role 'participant'
    const memberGroupAgents: NewChatGroupAgent[] = agentMembers.map((agentId, index) => ({
      agentId,
      chatGroupId: group.id,
      order: index,
      role: 'participant',
      userId: this.userId,
    }));

    // 5. Insert all group-agent relationships
    const allGroupAgents = [supervisorGroupAgent, ...memberGroupAgents];
    const insertedAgents = await this.db
      .insert(chatGroupsAgents)
      .values(allGroupAgents)
      .returning();

    return {
      agents: insertedAgents,
      group,
      supervisorAgentId: supervisorAgent.id,
    };
  }
}
