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
    it('should return group with its agents (including auto-created supervisor)', async () => {
      // Create test data
      await serverDB.insert(chatGroups).values({
        description: 'Test group description',
        id: 'test-group-1',
        title: 'Test Group',
        userId,
      });

      await serverDB.insert(agents).values([
        {
          avatar: 'avatar1.png',
          description: 'Agent 1 description',
          id: 'agent-1',
          title: 'Agent 1',
          userId,
        },
        {
          avatar: 'avatar2.png',
          description: 'Agent 2 description',
          id: 'agent-2',
          title: 'Agent 2',
          userId,
        },
      ]);

      // Link agents to group with order (as participants)
      await serverDB.insert(chatGroupsAgents).values([
        { agentId: 'agent-1', chatGroupId: 'test-group-1', order: 1, role: 'participant', userId },
        { agentId: 'agent-2', chatGroupId: 'test-group-1', order: 0, role: 'participant', userId },
      ]);

      const result = await agentGroupRepo.findByIdWithAgents('test-group-1');

      expect(result).toMatchObject({
        description: 'Test group description',
        id: 'test-group-1',
        title: 'Test Group',
      });
      // 2 participants + 1 auto-created supervisor
      expect(result!.agents).toHaveLength(3);
      expect(result!.supervisorAgentId).toBeDefined();

      // Verify agents structure: supervisor first, then participants ordered by order field
      expect(result!.agents).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ isSupervisor: true, title: 'Supervisor', virtual: true }),
          expect.objectContaining({ id: 'agent-1', isSupervisor: false, title: 'Agent 1' }),
          expect.objectContaining({ id: 'agent-2', isSupervisor: false, title: 'Agent 2' }),
        ]),
      );
    });

    it('should return null for non-existent group', async () => {
      const result = await agentGroupRepo.findByIdWithAgents('non-existent-group');

      expect(result).toBeNull();
    });

    it('should auto-create supervisor when no agents assigned', async () => {
      await serverDB.insert(chatGroups).values({
        id: 'empty-group',
        title: 'Empty Group',
        userId,
      });

      const result = await agentGroupRepo.findByIdWithAgents('empty-group');

      expect(result).toMatchObject({
        id: 'empty-group',
        title: 'Empty Group',
      });
      expect(result!.supervisorAgentId).toBeDefined();
      // Should have auto-created supervisor
      expect(result!.agents).toEqual([
        expect.objectContaining({ isSupervisor: true, title: 'Supervisor', virtual: true }),
      ]);
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
      // Create supervisor agent first
      await serverDB.insert(agents).values({
        id: 'detail-supervisor',
        title: 'Supervisor',
        userId,
        virtual: true,
      });

      // Create group
      await serverDB.insert(chatGroups).values({
        config: { scene: 'casual' },
        id: 'detail-group',
        title: 'Detail Group',
        userId,
      });

      // Create agent with all fields
      await serverDB.insert(agents).values({
        avatar: 'test-avatar.png',
        backgroundColor: '#ff0000',
        description: 'Full agent description',
        id: 'full-agent',
        model: 'gpt-4',
        provider: 'openai',
        systemRole: 'You are a helpful assistant',
        title: 'Full Agent',
        userId,
      });

      // Link supervisor and participant agents
      await serverDB.insert(chatGroupsAgents).values([
        {
          agentId: 'detail-supervisor',
          chatGroupId: 'detail-group',
          order: -1,
          role: 'supervisor',
          userId,
        },
        {
          agentId: 'full-agent',
          chatGroupId: 'detail-group',
          order: 0,
          role: 'participant',
          userId,
        },
      ]);

      const result = await agentGroupRepo.findByIdWithAgents('detail-group');

      expect(result).toMatchObject({
        id: 'detail-group',
        supervisorAgentId: 'detail-supervisor',
        title: 'Detail Group',
      });
      // 1 supervisor + 1 participant
      expect(result!.agents).toHaveLength(2);

      // Verify agents include full details
      expect(result!.agents).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ id: 'detail-supervisor', isSupervisor: true, virtual: true }),
          expect.objectContaining({
            avatar: 'test-avatar.png',
            backgroundColor: '#ff0000',
            description: 'Full agent description',
            id: 'full-agent',
            isSupervisor: false,
            model: 'gpt-4',
            provider: 'openai',
            systemRole: 'You are a helpful assistant',
            title: 'Full Agent',
          }),
        ]),
      );
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

    it('should return supervisorAgentId when supervisor exists', async () => {
      // Create group
      await serverDB.insert(chatGroups).values({
        id: 'supervisor-group',
        title: 'Group with Supervisor',
        userId,
      });

      // Create supervisor and participant agents
      await serverDB.insert(agents).values([
        { id: 'supervisor-agent', title: 'Supervisor', userId, virtual: true },
        { id: 'participant-agent', title: 'Participant', userId },
      ]);

      // Link agents with roles
      await serverDB.insert(chatGroupsAgents).values([
        {
          agentId: 'supervisor-agent',
          chatGroupId: 'supervisor-group',
          order: -1,
          role: 'supervisor',
          userId,
        },
        {
          agentId: 'participant-agent',
          chatGroupId: 'supervisor-group',
          order: 0,
          role: 'participant',
          userId,
        },
      ]);

      const result = await agentGroupRepo.findByIdWithAgents('supervisor-group');

      expect(result).toMatchObject({
        id: 'supervisor-group',
        supervisorAgentId: 'supervisor-agent',
      });
      expect(result!.agents).toHaveLength(2);

      // Verify agents order: supervisor first due to order: -1
      expect(result!.agents).toEqual([
        expect.objectContaining({ id: 'supervisor-agent', isSupervisor: true }),
        expect.objectContaining({ id: 'participant-agent', isSupervisor: false }),
      ]);
    });

    it('should auto-create virtual supervisor when no supervisor exists', async () => {
      // Create group without supervisor
      await serverDB.insert(chatGroups).values({
        config: {
          orchestratorModel: 'gpt-4o',
          orchestratorProvider: 'openai',
          scene: 'casual',
        },
        id: 'no-supervisor-group',
        title: 'Group without Supervisor',
        userId,
      });

      await serverDB.insert(agents).values({
        id: 'regular-agent',
        title: 'Regular Agent',
        userId,
      });

      await serverDB.insert(chatGroupsAgents).values({
        agentId: 'regular-agent',
        chatGroupId: 'no-supervisor-group',
        role: 'participant',
        userId,
      });

      const result = await agentGroupRepo.findByIdWithAgents('no-supervisor-group');

      expect(result).toMatchObject({
        id: 'no-supervisor-group',
        title: 'Group without Supervisor',
      });
      // Supervisor should be auto-created
      expect(result!.supervisorAgentId).toBeDefined();
      // Should have 2 agents: auto-created supervisor + regular agent
      expect(result!.agents).toHaveLength(2);

      // Verify agents include auto-created supervisor with config from group
      expect(result!.agents).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            isSupervisor: true,
            model: 'gpt-4o',
            provider: 'openai',
            title: 'Supervisor',
            virtual: true,
          }),
          expect.objectContaining({
            id: 'regular-agent',
            isSupervisor: false,
            title: 'Regular Agent',
          }),
        ]),
      );

      // Calling again should return the same supervisor (not create another one)
      const result2 = await agentGroupRepo.findByIdWithAgents('no-supervisor-group');
      expect(result2!.supervisorAgentId).toBe(result!.supervisorAgentId);
      expect(result2!.agents).toHaveLength(2);
    });

    it('should auto-create supervisor for group with empty agents', async () => {
      await serverDB.insert(chatGroups).values({
        id: 'empty-agents-group',
        title: 'Empty Agents Group',
        userId,
      });

      const result = await agentGroupRepo.findByIdWithAgents('empty-agents-group');

      expect(result).toMatchObject({
        id: 'empty-agents-group',
        title: 'Empty Agents Group',
      });
      expect(result!.supervisorAgentId).toBeDefined();
      // Only the auto-created supervisor
      expect(result!.agents).toEqual([
        expect.objectContaining({ isSupervisor: true, title: 'Supervisor', virtual: true }),
      ]);
    });
  });

  describe('createGroupWithSupervisor', () => {
    it('should create group with supervisor agent', async () => {
      const result = await agentGroupRepo.createGroupWithSupervisor({
        config: {
          orchestratorModel: 'gpt-4',
          orchestratorProvider: 'openai',
          scene: 'productive',
        },
        title: 'New Group with Supervisor',
      });

      expect(result).toMatchObject({
        group: expect.objectContaining({ title: 'New Group with Supervisor' }),
      });
      expect(result.supervisorAgentId).toBeDefined();
      expect(result.agents).toEqual([expect.objectContaining({ role: 'supervisor' })]);

      // Verify supervisor agent was created with correct config
      const groupDetail = await agentGroupRepo.findByIdWithAgents(result.group.id);
      expect(groupDetail).toMatchObject({
        supervisorAgentId: result.supervisorAgentId,
      });
      expect(groupDetail!.agents).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: result.supervisorAgentId,
            model: 'gpt-4',
            provider: 'openai',
            title: 'Supervisor',
            virtual: true,
          }),
        ]),
      );
    });

    it('should create group with supervisor and member agents', async () => {
      // Create member agents first
      await serverDB.insert(agents).values([
        { id: 'member-1', title: 'Member 1', userId },
        { id: 'member-2', title: 'Member 2', userId },
      ]);

      const result = await agentGroupRepo.createGroupWithSupervisor(
        { title: 'Group with Members' },
        ['member-1', 'member-2'],
      );

      expect(result).toMatchObject({
        group: expect.objectContaining({ title: 'Group with Members' }),
      });
      expect(result.supervisorAgentId).toBeDefined();
      // 1 supervisor + 2 members
      expect(result.agents).toHaveLength(3);

      // Check roles and order
      expect(result.agents).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ order: -1, role: 'supervisor' }),
          expect.objectContaining({ agentId: 'member-1', order: 0, role: 'participant' }),
          expect.objectContaining({ agentId: 'member-2', order: 1, role: 'participant' }),
        ]),
      );
    });

    it('should use custom supervisor config when provided', async () => {
      const result = await agentGroupRepo.createGroupWithSupervisor(
        { title: 'Custom Supervisor Group' },
        [],
        {
          model: 'claude-3-opus',
          provider: 'anthropic',
          title: 'Custom Host',
        },
      );

      const groupDetail = await agentGroupRepo.findByIdWithAgents(result.group.id);
      expect(groupDetail!.agents).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: result.supervisorAgentId,
            model: 'claude-3-opus',
            provider: 'anthropic',
            title: 'Custom Host',
          }),
        ]),
      );
    });

    it('should create group with empty member agents', async () => {
      const result = await agentGroupRepo.createGroupWithSupervisor({
        title: 'Supervisor Only Group',
      });

      expect(result).toMatchObject({
        group: expect.objectContaining({ title: 'Supervisor Only Group' }),
      });
      expect(result.supervisorAgentId).toBeDefined();
      // Only supervisor
      expect(result.agents).toEqual([expect.objectContaining({ role: 'supervisor' })]);
    });
  });
});
