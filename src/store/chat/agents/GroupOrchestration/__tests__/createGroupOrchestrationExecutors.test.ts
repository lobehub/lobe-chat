import type {
  AgentState,
  GroupOrchestrationInstructionAgentSpoke,
  GroupOrchestrationInstructionAgentsBroadcasted,
  GroupOrchestrationInstructionBroadcast,
  GroupOrchestrationInstructionCallSupervisor,
  GroupOrchestrationInstructionFinish,
  GroupOrchestrationInstructionSpeak,
} from '@lobechat/agent-runtime';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { ChatStore } from '@/store/chat/store';

import {
  type GroupOrchestrationExecutorsContext,
  createGroupOrchestrationExecutors,
} from '../createGroupOrchestrationExecutors';

// Helper to create mock ChatStore
const createMockStore = () => {
  const operationCounter = { current: 0 };

  return {
    internal_execAgentRuntime: vi.fn().mockResolvedValue(undefined),
    messagesMap: {
      'group_group-1_topic-1': [
        { content: 'Hello', id: 'msg-1', role: 'user' },
        { content: 'Hi there', id: 'msg-2', role: 'assistant' },
      ],
    },
    startOperation: vi.fn().mockImplementation(({ context, parentOperationId, type }) => {
      operationCounter.current++;
      return {
        abortController: new AbortController(),
        operationId: `op-${operationCounter.current}`,
      };
    }),
    // Add other methods as needed
  } as unknown as ChatStore;
};

// Helper to create mock AgentState
const createMockState = (overrides: Partial<AgentState> = {}): AgentState => ({
  cost: {
    calculatedAt: new Date().toISOString(),
    currency: 'USD',
    llm: { byModel: [], currency: 'USD', total: 0 },
    tools: { byTool: [], currency: 'USD', total: 0 },
    total: 0,
  },
  createdAt: new Date().toISOString(),
  lastModified: new Date().toISOString(),
  messages: [],
  operationId: 'test-operation',
  status: 'running',
  stepCount: 0,
  toolManifestMap: {},
  usage: {
    humanInteraction: {
      approvalRequests: 0,
      promptRequests: 0,
      selectRequests: 0,
      totalWaitingTimeMs: 0,
    },
    llm: { apiCalls: 0, processingTimeMs: 0, tokens: { input: 0, output: 0, total: 0 } },
    tools: { byTool: [], totalCalls: 0, totalTimeMs: 0 },
  },
  ...overrides,
});

describe('createGroupOrchestrationExecutors', () => {
  let mockStore: ReturnType<typeof createMockStore>;
  let context: GroupOrchestrationExecutorsContext;

  beforeEach(() => {
    mockStore = createMockStore();
    context = {
      get: () => mockStore,
      messageContext: {
        agentId: 'group-1',
        groupId: 'group-1',
        scope: 'group',
        topicId: 'topic-1',
      },
      orchestrationOperationId: 'orchestration-op-1',
      supervisorAgentId: 'supervisor-agent',
    };
  });

  describe('factory function', () => {
    it('should return all required executors', () => {
      const executors = createGroupOrchestrationExecutors(context);

      expect(executors.call_supervisor).toBeDefined();
      expect(executors.speak).toBeDefined();
      expect(executors.broadcast).toBeDefined();
      expect(executors.agent_spoke).toBeDefined();
      expect(executors.agents_broadcasted).toBeDefined();
      expect(executors.finish).toBeDefined();
    });

    it('should work without topicId', () => {
      const contextWithoutTopic: GroupOrchestrationExecutorsContext = {
        get: () => mockStore,
        messageContext: {
          agentId: 'group-1',
          groupId: 'group-1',
          scope: 'group',
        },
        orchestrationOperationId: 'orchestration-op-1',
        supervisorAgentId: 'supervisor-agent',
      };

      const executors = createGroupOrchestrationExecutors(contextWithoutTopic);

      expect(executors.call_supervisor).toBeDefined();
    });
  });

  describe('call_supervisor executor', () => {
    it('should call internal_execAgentRuntime with correct parameters', async () => {
      const executors = createGroupOrchestrationExecutors(context);
      const state = createMockState();

      const instruction: GroupOrchestrationInstructionCallSupervisor = {
        payload: {
          groupId: 'group-1',
          round: 0,
          supervisorAgentId: 'supervisor-agent',
        },
        type: 'call_supervisor',
      };

      await executors.call_supervisor!(instruction, state);

      expect(mockStore.internal_execAgentRuntime).toHaveBeenCalledWith({
        context: {
          agentId: 'supervisor-agent',
          groupId: 'group-1',
          scope: 'group',
          topicId: 'topic-1',
        },
        messages: expect.any(Array),
        operationId: state.operationId,
        parentMessageId: 'msg-2',
        parentMessageType: 'assistant',
        parentOperationId: 'orchestration-op-1',
      });
    });

    it('should return supervisor_finished event and done status', async () => {
      const executors = createGroupOrchestrationExecutors(context);
      const state = createMockState();

      const instruction: GroupOrchestrationInstructionCallSupervisor = {
        payload: {
          groupId: 'group-1',
          round: 0,
          supervisorAgentId: 'supervisor-agent',
        },
        type: 'call_supervisor',
      };

      const result = await executors.call_supervisor!(instruction, state);

      expect(result.events).toHaveLength(1);
      expect(result.events[0]).toEqual({ type: 'supervisor_finished' });
      expect(result.newState.status).toBe('done');
      expect(result.nextContext).toBeUndefined();
    });
  });

  describe('speak executor', () => {
    it('should call internal_execAgentRuntime for target agent with subAgentId', async () => {
      const executors = createGroupOrchestrationExecutors(context);
      const state = createMockState();

      const instruction: GroupOrchestrationInstructionSpeak = {
        payload: {
          agentId: 'agent-1',
          instruction: 'Please respond to the user question',
        },
        type: 'speak',
      };

      await executors.speak!(instruction, state);

      // Should use subAgentId for agent config retrieval while keeping groupId in context
      expect(mockStore.internal_execAgentRuntime).toHaveBeenCalledWith({
        context: expect.objectContaining({
          agentId: 'group-1', // agentId remains as group's main agent ID
          subAgentId: 'agent-1', // subAgentId is used for agent config retrieval
          groupId: 'group-1',
          scope: 'group',
        }),
        messages: expect.any(Array),
        parentMessageId: 'msg-2',
        parentMessageType: 'assistant',
        parentOperationId: 'orchestration-op-1',
      });
    });

    it('should return agent_spoke event and next context', async () => {
      const executors = createGroupOrchestrationExecutors(context);
      const state = createMockState();

      const instruction: GroupOrchestrationInstructionSpeak = {
        payload: {
          agentId: 'agent-1',
          instruction: 'Respond',
        },
        type: 'speak',
      };

      const result = await executors.speak!(instruction, state);

      expect(result.events).toHaveLength(1);
      expect(result.events[0]).toEqual({ agentId: 'agent-1', type: 'agent_spoke' });
      expect(result.newState).toBe(state); // State unchanged
      expect(result.nextContext).toEqual({
        payload: { agentId: 'agent-1', completed: true },
        phase: 'agent_spoke',
      });
    });

    it('should handle instruction without optional instruction text', async () => {
      const executors = createGroupOrchestrationExecutors(context);
      const state = createMockState();

      const instruction: GroupOrchestrationInstructionSpeak = {
        payload: {
          agentId: 'agent-1',
        },
        type: 'speak',
      };

      const result = await executors.speak!(instruction, state);

      expect(result.events[0]).toEqual({ agentId: 'agent-1', type: 'agent_spoke' });
    });
  });

  describe('broadcast executor', () => {
    it('should call internal_execAgentRuntime for all agents with subAgentId', async () => {
      const executors = createGroupOrchestrationExecutors(context);
      const state = createMockState();

      const instruction: GroupOrchestrationInstructionBroadcast = {
        payload: {
          agentIds: ['agent-1', 'agent-2', 'agent-3'],
          instruction: 'Discuss the topic',
          toolMessageId: 'tool-msg-1',
        },
        type: 'broadcast',
      };

      await executors.broadcast!(instruction, state);

      // Should call internal_execAgentRuntime for each agent with subAgentId
      expect(mockStore.internal_execAgentRuntime).toHaveBeenCalledTimes(3);

      // Each call should use subAgentId for the target agent while keeping groupId in context
      // parentMessageId should be toolMessageId (tool message that triggered broadcast)
      expect(mockStore.internal_execAgentRuntime).toHaveBeenCalledWith({
        context: expect.objectContaining({
          agentId: 'group-1', // agentId remains as group's main agent ID
          subAgentId: 'agent-1', // subAgentId is used for agent config retrieval
          groupId: 'group-1',
          scope: 'group',
        }),
        messages: expect.any(Array),
        parentMessageId: 'tool-msg-1', // Should use toolMessageId, not lastMessage.id
        parentMessageType: 'tool',
        parentOperationId: 'orchestration-op-1',
      });

      expect(mockStore.internal_execAgentRuntime).toHaveBeenCalledWith({
        context: expect.objectContaining({
          agentId: 'group-1',
          subAgentId: 'agent-2',
          groupId: 'group-1',
          scope: 'group',
        }),
        messages: expect.any(Array),
        parentMessageId: 'tool-msg-1',
        parentMessageType: 'tool',
        parentOperationId: 'orchestration-op-1',
      });

      expect(mockStore.internal_execAgentRuntime).toHaveBeenCalledWith({
        context: expect.objectContaining({
          agentId: 'group-1',
          subAgentId: 'agent-3',
          groupId: 'group-1',
          scope: 'group',
        }),
        messages: expect.any(Array),
        parentMessageId: 'tool-msg-1',
        parentMessageType: 'tool',
        parentOperationId: 'orchestration-op-1',
      });
    });

    it('should return agents_broadcasted event and next context', async () => {
      const executors = createGroupOrchestrationExecutors(context);
      const state = createMockState();

      const instruction: GroupOrchestrationInstructionBroadcast = {
        payload: {
          agentIds: ['agent-1', 'agent-2'],
          instruction: 'Discuss',
          toolMessageId: 'tool-msg-1',
        },
        type: 'broadcast',
      };

      const result = await executors.broadcast!(instruction, state);

      expect(result.events).toHaveLength(1);
      expect(result.events[0]).toEqual({
        agentIds: ['agent-1', 'agent-2'],
        type: 'agents_broadcasted',
      });
      expect(result.newState).toBe(state);
      expect(result.nextContext).toEqual({
        payload: { agentIds: ['agent-1', 'agent-2'], completed: true },
        phase: 'agents_broadcasted',
      });
    });

    it('should handle empty agent list', async () => {
      const executors = createGroupOrchestrationExecutors(context);
      const state = createMockState();

      const instruction: GroupOrchestrationInstructionBroadcast = {
        payload: {
          agentIds: [],
          toolMessageId: 'tool-msg-1',
        },
        type: 'broadcast',
      };

      const result = await executors.broadcast!(instruction, state);

      expect(mockStore.startOperation).not.toHaveBeenCalled();
      expect(result.events[0]).toEqual({ agentIds: [], type: 'agents_broadcasted' });
    });
  });

  describe('agent_spoke executor', () => {
    it('should increment orchestration round and return to call_supervisor', async () => {
      const executors = createGroupOrchestrationExecutors(context);
      const state = createMockState({ orchestrationRound: 0 } as any);

      const instruction: GroupOrchestrationInstructionAgentSpoke = {
        payload: {
          agentId: 'agent-1',
          completed: true,
        },
        type: 'agent_spoke',
      };

      const result = await executors.agent_spoke!(instruction, state);

      expect(result.events).toHaveLength(0);
      expect((result.newState as any).orchestrationRound).toBe(1);
      expect(result.nextContext).toEqual({
        payload: { round: 1 },
        phase: 'call_supervisor',
      });
    });

    it('should use default round 0 when orchestrationRound is not set', async () => {
      const executors = createGroupOrchestrationExecutors(context);
      const state = createMockState(); // No orchestrationRound

      const instruction: GroupOrchestrationInstructionAgentSpoke = {
        payload: {
          agentId: 'agent-1',
          completed: true,
        },
        type: 'agent_spoke',
      };

      const result = await executors.agent_spoke!(instruction, state);

      expect((result.newState as any).orchestrationRound).toBe(1);
    });

    it('should stop when max rounds exceeded', async () => {
      const executors = createGroupOrchestrationExecutors(context);
      const state = createMockState({
        maxRounds: 5,
        orchestrationRound: 4,
      } as any);

      const instruction: GroupOrchestrationInstructionAgentSpoke = {
        payload: {
          agentId: 'agent-1',
          completed: true,
        },
        type: 'agent_spoke',
      };

      const result = await executors.agent_spoke!(instruction, state);

      expect(result.events).toHaveLength(1);
      expect(result.events[0]).toEqual({ type: 'max_rounds_exceeded' });
      expect(result.newState.status).toBe('done');
      expect(result.nextContext).toBeUndefined();
    });

    it('should use default maxRounds of 10', async () => {
      const executors = createGroupOrchestrationExecutors(context);
      const state = createMockState({ orchestrationRound: 8 } as any);

      const instruction: GroupOrchestrationInstructionAgentSpoke = {
        payload: {
          agentId: 'agent-1',
          completed: true,
        },
        type: 'agent_spoke',
      };

      const result = await executors.agent_spoke!(instruction, state);

      // Round 9 (< 10), should continue
      expect(result.newState.status).not.toBe('done');
      expect((result.newState as any).orchestrationRound).toBe(9);
    });

    it('should stop at exactly max rounds', async () => {
      const executors = createGroupOrchestrationExecutors(context);
      const state = createMockState({ orchestrationRound: 9 } as any); // Default maxRounds is 10

      const instruction: GroupOrchestrationInstructionAgentSpoke = {
        payload: {
          agentId: 'agent-1',
          completed: true,
        },
        type: 'agent_spoke',
      };

      const result = await executors.agent_spoke!(instruction, state);

      // Round 10 (>= 10), should stop
      expect(result.events[0]).toEqual({ type: 'max_rounds_exceeded' });
      expect(result.newState.status).toBe('done');
    });
  });

  describe('agents_broadcasted executor', () => {
    it('should increment orchestration round and return to call_supervisor', async () => {
      const executors = createGroupOrchestrationExecutors(context);
      const state = createMockState({ orchestrationRound: 1 } as any);

      const instruction: GroupOrchestrationInstructionAgentsBroadcasted = {
        payload: {
          agentIds: ['agent-1', 'agent-2'],
          completed: true,
        },
        type: 'agents_broadcasted',
      };

      const result = await executors.agents_broadcasted!(instruction, state);

      expect(result.events).toHaveLength(0);
      expect((result.newState as any).orchestrationRound).toBe(2);
      expect(result.nextContext).toEqual({
        payload: { round: 2 },
        phase: 'call_supervisor',
      });
    });

    it('should stop when max rounds exceeded', async () => {
      const executors = createGroupOrchestrationExecutors(context);
      const state = createMockState({
        maxRounds: 3,
        orchestrationRound: 2,
      } as any);

      const instruction: GroupOrchestrationInstructionAgentsBroadcasted = {
        payload: {
          agentIds: ['agent-1', 'agent-2'],
          completed: true,
        },
        type: 'agents_broadcasted',
      };

      const result = await executors.agents_broadcasted!(instruction, state);

      expect(result.events).toHaveLength(1);
      expect(result.events[0]).toEqual({ type: 'max_rounds_exceeded' });
      expect(result.newState.status).toBe('done');
      expect(result.nextContext).toBeUndefined();
    });

    it('should use default maxRounds of 10', async () => {
      const executors = createGroupOrchestrationExecutors(context);
      const state = createMockState({ orchestrationRound: 5 } as any);

      const instruction: GroupOrchestrationInstructionAgentsBroadcasted = {
        payload: {
          agentIds: ['agent-1'],
          completed: true,
        },
        type: 'agents_broadcasted',
      };

      const result = await executors.agents_broadcasted!(instruction, state);

      // Round 6 (< 10), should continue
      expect(result.newState.status).not.toBe('done');
    });
  });

  describe('finish executor', () => {
    it('should return done event with reason', async () => {
      const executors = createGroupOrchestrationExecutors(context);
      const state = createMockState();

      const instruction: GroupOrchestrationInstructionFinish = {
        reason: 'Task completed successfully',
        type: 'finish',
      };

      const result = await executors.finish!(instruction, state);

      expect(result.events).toHaveLength(1);
      expect(result.events[0]).toEqual({
        reason: 'Task completed successfully',
        type: 'done',
      });
      expect(result.newState.status).toBe('done');
      expect(result.nextContext).toBeUndefined();
    });

    it('should preserve original state properties except status', async () => {
      const executors = createGroupOrchestrationExecutors(context);
      const state = createMockState({
        messages: [{ content: 'test', role: 'user' }],
        stepCount: 5,
      } as any);

      const instruction: GroupOrchestrationInstructionFinish = {
        reason: 'Done',
        type: 'finish',
      };

      const result = await executors.finish!(instruction, state);

      expect(result.newState.messages).toEqual([{ content: 'test', role: 'user' }]);
      expect(result.newState.stepCount).toBe(5);
      expect(result.newState.status).toBe('done');
    });
  });

  describe('Integration: Orchestration Flow', () => {
    it('should complete a full speak flow', async () => {
      const executors = createGroupOrchestrationExecutors(context);

      // Step 1: call_supervisor returns speak
      const state1 = createMockState({ orchestrationRound: 0 } as any);
      const speakInstruction: GroupOrchestrationInstructionSpeak = {
        payload: { agentId: 'agent-1', instruction: 'Respond' },
        type: 'speak',
      };

      const result1 = await executors.speak!(speakInstruction, state1);
      expect(result1.nextContext?.phase).toBe('agent_spoke');

      // Step 2: agent_spoke returns to call_supervisor
      const agentSpokeInstruction: GroupOrchestrationInstructionAgentSpoke = {
        payload: { agentId: 'agent-1', completed: true },
        type: 'agent_spoke',
      };

      const result2 = await executors.agent_spoke!(agentSpokeInstruction, result1.newState);
      expect(result2.nextContext?.phase).toBe('call_supervisor');
      expect((result2.newState as any).orchestrationRound).toBe(1);
    });

    it('should complete a full broadcast flow', async () => {
      const executors = createGroupOrchestrationExecutors(context);

      // Step 1: broadcast to multiple agents
      const state1 = createMockState({ orchestrationRound: 0 } as any);
      const broadcastInstruction: GroupOrchestrationInstructionBroadcast = {
        payload: {
          agentIds: ['agent-1', 'agent-2'],
          instruction: 'Discuss',
          toolMessageId: 'tool-msg-1',
        },
        type: 'broadcast',
      };

      const result1 = await executors.broadcast!(broadcastInstruction, state1);
      expect(result1.nextContext?.phase).toBe('agents_broadcasted');
      expect(mockStore.internal_execAgentRuntime).toHaveBeenCalledTimes(2);

      // Step 2: agents_broadcasted returns to call_supervisor
      const agentsBroadcastedInstruction: GroupOrchestrationInstructionAgentsBroadcasted = {
        payload: { agentIds: ['agent-1', 'agent-2'], completed: true },
        type: 'agents_broadcasted',
      };

      const result2 = await executors.agents_broadcasted!(
        agentsBroadcastedInstruction,
        result1.newState,
      );
      expect(result2.nextContext?.phase).toBe('call_supervisor');
    });

    it('should handle multi-round orchestration until max rounds', async () => {
      const executors = createGroupOrchestrationExecutors(context);
      let state = createMockState({ maxRounds: 3, orchestrationRound: 0 } as any);

      const agentSpokeInstruction: GroupOrchestrationInstructionAgentSpoke = {
        payload: { agentId: 'agent-1', completed: true },
        type: 'agent_spoke',
      };

      // Round 1
      let result = await executors.agent_spoke!(agentSpokeInstruction, state);
      expect((result.newState as any).orchestrationRound).toBe(1);
      expect(result.nextContext?.phase).toBe('call_supervisor');

      // Round 2
      result = await executors.agent_spoke!(agentSpokeInstruction, result.newState);
      expect((result.newState as any).orchestrationRound).toBe(2);
      expect(result.nextContext?.phase).toBe('call_supervisor');

      // Round 3 - should stop
      result = await executors.agent_spoke!(agentSpokeInstruction, result.newState);
      expect(result.events[0]).toEqual({ type: 'max_rounds_exceeded' });
      expect(result.newState.status).toBe('done');
      expect(result.nextContext).toBeUndefined();
    });
  });
});
