// @vitest-environment node
import { beforeEach, describe, expect, it } from 'vitest';

import { getTestDB } from '../../models/__tests__/_util';
import { agents } from '../../schemas/agent';
import { chatGroups, chatGroupsAgents } from '../../schemas/chatGroup';
import { users } from '../../schemas/user';
import { LobeChatDatabase } from '../../type';
import { AgentGroupRepository } from './index';

const userId = 'agent-group-test-user';
const otherUserId = 'other-agent-group-user';

let agentGroupRepo: AgentGroupRepository;

const serverDB: LobeChatDatabase = await getTestDB();

beforeEach(async () => {
  // Clean up
  await serverDB.delete(users);

  // Create test users
  await serverDB.insert(users).values([{ id: userId }, { id: otherUserId }]);

  // Initialize repo
  agentGroupRepo = new AgentGroupRepository(serverDB, userId);
});

describe('AgentGroupRepository', () => {
  describe('findByIdWithAgents', () => {
    it('should return group with its agents', async () => {
      // Create test data
      const [group] = await serverDB
        .insert(chatGroups)
        .values({
          description: 'Test group description',
          id: 'test-group-1',
          title: 'Test Group',
          userId,
        })
        .returning();

      const [agent1] = await serverDB
        .insert(agents)
        .values({
          avatar: 'avatar1.png',
          description: 'Agent 1 description',
          id: 'agent-1',
          title: 'Agent 1',
          userId,
        })
        .returning();

      const [agent2] = await serverDB
        .insert(agents)
        .values({
          avatar: 'avatar2.png',
          description: 'Agent 2 description',
          id: 'agent-2',
          title: 'Agent 2',
          userId,
        })
        .returning();

      // Link agents to group with order
      await serverDB.insert(chatGroupsAgents).values([
        { agentId: agent1.id, chatGroupId: group.id, order: 1, userId },
        { agentId: agent2.id, chatGroupId: group.id, order: 0, userId },
      ]);

      const result = await agentGroupRepo.findByIdWithAgents('test-group-1');

      expect(result).not.toBeNull();
      expect(result!.id).toBe('test-group-1');
      expect(result!.title).toBe('Test Group');
      expect(result!.description).toBe('Test group description');
      expect(result!.agents).toHaveLength(2);

      // Agents should be ordered by order field
      expect(result!.agents[0].id).toBe('agent-2'); // order: 0
      expect(result!.agents[0].title).toBe('Agent 2');
      expect(result!.agents[1].id).toBe('agent-1'); // order: 1
      expect(result!.agents[1].title).toBe('Agent 1');
    });

    it('should return null for non-existent group', async () => {
      const result = await agentGroupRepo.findByIdWithAgents('non-existent-group');

      expect(result).toBeNull();
    });

    it('should return group with empty agents array when no agents assigned', async () => {
      await serverDB.insert(chatGroups).values({
        id: 'empty-group',
        title: 'Empty Group',
        userId,
      });

      const result = await agentGroupRepo.findByIdWithAgents('empty-group');

      expect(result).not.toBeNull();
      expect(result!.id).toBe('empty-group');
      expect(result!.title).toBe('Empty Group');
      expect(result!.agents).toEqual([]);
    });

    it('should not return groups belonging to other users', async () => {
      // Create group for other user
      await serverDB.insert(chatGroups).values({
        id: 'other-user-group',
        title: 'Other User Group',
        userId: otherUserId,
      });

      const result = await agentGroupRepo.findByIdWithAgents('other-user-group');

      expect(result).toBeNull();
    });

    it('should return full agent details including all fields', async () => {
      // Create group
      const [group] = await serverDB
        .insert(chatGroups)
        .values({
          config: { scene: 'casual' },
          id: 'detail-group',
          title: 'Detail Group',
          userId,
        })
        .returning();

      // Create agent with all fields
      const [agent] = await serverDB
        .insert(agents)
        .values({
          avatar: 'test-avatar.png',
          backgroundColor: '#ff0000',
          description: 'Full agent description',
          id: 'full-agent',
          model: 'gpt-4',
          provider: 'openai',
          systemRole: 'You are a helpful assistant',
          title: 'Full Agent',
          userId,
        })
        .returning();

      await serverDB.insert(chatGroupsAgents).values({
        agentId: agent.id,
        chatGroupId: group.id,
        userId,
      });

      const result = await agentGroupRepo.findByIdWithAgents('detail-group');

      expect(result).not.toBeNull();
      expect(result!.agents).toHaveLength(1);

      const returnedAgent = result!.agents[0];
      expect(returnedAgent.id).toBe('full-agent');
      expect(returnedAgent.title).toBe('Full Agent');
      expect(returnedAgent.avatar).toBe('test-avatar.png');
      expect(returnedAgent.backgroundColor).toBe('#ff0000');
      expect(returnedAgent.description).toBe('Full agent description');
      expect(returnedAgent.model).toBe('gpt-4');
      expect(returnedAgent.provider).toBe('openai');
      expect(returnedAgent.systemRole).toBe('You are a helpful assistant');
    });

    it('should return group with config', async () => {
      await serverDB.insert(chatGroups).values({
        config: {
          maxResponseInRow: 3,
          responseOrder: 'sequential',
          scene: 'productive',
        },
        description: 'Group with config',
        id: 'config-group',
        pinned: true,
        title: 'Config Group',
        userId,
      });

      const result = await agentGroupRepo.findByIdWithAgents('config-group');

      expect(result).not.toBeNull();
      expect(result!.config).toEqual({
        maxResponseInRow: 3,
        responseOrder: 'sequential',
        scene: 'productive',
      });
      expect(result!.pinned).toBe(true);
    });
  });
});
