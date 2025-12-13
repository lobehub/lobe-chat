import type { AgentState, GroupOrchestrationContext } from '@lobechat/agent-runtime';
import { describe, expect, it } from 'vitest';

import {
  GroupOrchestrationSupervisor,
  type GroupOrchestrationConfig,
} from '../GroupOrchestrationSupervisor';

// Helper to create mock AgentState
const createMockState = (): AgentState => ({
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
});

describe('GroupOrchestrationSupervisor', () => {
  const defaultConfig: GroupOrchestrationConfig = {
    maxRounds: 10,
    supervisorAgentId: 'supervisor-agent-1',
  };

  describe('constructor', () => {
    it('should create instance with config', () => {
      const supervisor = new GroupOrchestrationSupervisor(defaultConfig);
      expect(supervisor).toBeInstanceOf(GroupOrchestrationSupervisor);
    });
  });

  describe('runner - call_supervisor phase', () => {
    it('should return call_supervisor instruction with config supervisorAgentId', async () => {
      const supervisor = new GroupOrchestrationSupervisor(defaultConfig);
      const state = createMockState();

      const context: GroupOrchestrationContext = {
        phase: 'call_supervisor',
        payload: {
          groupId: 'group-1',
          round: 0,
        },
      };

      const result = await supervisor.runner(context, state);

      expect(result).toEqual({
        payload: {
          groupId: 'group-1',
          round: 0,
          supervisorAgentId: 'supervisor-agent-1',
        },
        type: 'call_supervisor',
      });
    });

    it('should use supervisorAgentId from config, not payload', async () => {
      const config: GroupOrchestrationConfig = {
        maxRounds: 5,
        supervisorAgentId: 'my-custom-supervisor',
      };
      const supervisor = new GroupOrchestrationSupervisor(config);
      const state = createMockState();

      const context: GroupOrchestrationContext = {
        phase: 'call_supervisor',
        payload: {
          groupId: 'group-2',
          round: 3,
          supervisorAgentId: 'should-be-ignored', // This should be overwritten
        },
      };

      const result = await supervisor.runner(context, state);

      expect(result.type).toBe('call_supervisor');
      expect((result as any).payload.supervisorAgentId).toBe('my-custom-supervisor');
    });

    it('should handle missing payload gracefully', async () => {
      const supervisor = new GroupOrchestrationSupervisor(defaultConfig);
      const state = createMockState();

      const context: GroupOrchestrationContext = {
        phase: 'call_supervisor',
        // No payload
      };

      const result = await supervisor.runner(context, state);

      expect(result.type).toBe('call_supervisor');
      expect((result as any).payload.supervisorAgentId).toBe('supervisor-agent-1');
      expect((result as any).payload.groupId).toBeUndefined();
      expect((result as any).payload.round).toBeUndefined();
    });
  });

  describe('runner - speak phase', () => {
    it('should return speak instruction with payload', async () => {
      const supervisor = new GroupOrchestrationSupervisor(defaultConfig);
      const state = createMockState();

      const context: GroupOrchestrationContext = {
        phase: 'speak',
        payload: {
          agentId: 'agent-1',
          instruction: 'Please respond to the user',
        },
      };

      const result = await supervisor.runner(context, state);

      expect(result).toEqual({
        payload: {
          agentId: 'agent-1',
          instruction: 'Please respond to the user',
        },
        type: 'speak',
      });
    });

    it('should handle speak without instruction', async () => {
      const supervisor = new GroupOrchestrationSupervisor(defaultConfig);
      const state = createMockState();

      const context: GroupOrchestrationContext = {
        phase: 'speak',
        payload: {
          agentId: 'agent-2',
        },
      };

      const result = await supervisor.runner(context, state);

      expect(result.type).toBe('speak');
      expect((result as any).payload.agentId).toBe('agent-2');
    });
  });

  describe('runner - broadcast phase', () => {
    it('should return broadcast instruction with payload', async () => {
      const supervisor = new GroupOrchestrationSupervisor(defaultConfig);
      const state = createMockState();

      const context: GroupOrchestrationContext = {
        phase: 'broadcast',
        payload: {
          agentIds: ['agent-1', 'agent-2', 'agent-3'],
          instruction: 'Discuss the topic',
        },
      };

      const result = await supervisor.runner(context, state);

      expect(result).toEqual({
        payload: {
          agentIds: ['agent-1', 'agent-2', 'agent-3'],
          instruction: 'Discuss the topic',
        },
        type: 'broadcast',
      });
    });

    it('should handle broadcast without instruction', async () => {
      const supervisor = new GroupOrchestrationSupervisor(defaultConfig);
      const state = createMockState();

      const context: GroupOrchestrationContext = {
        phase: 'broadcast',
        payload: {
          agentIds: ['agent-1', 'agent-2'],
        },
      };

      const result = await supervisor.runner(context, state);

      expect(result.type).toBe('broadcast');
      expect((result as any).payload.agentIds).toEqual(['agent-1', 'agent-2']);
    });
  });

  describe('runner - delegate phase', () => {
    it('should return delegate instruction with payload', async () => {
      const supervisor = new GroupOrchestrationSupervisor(defaultConfig);
      const state = createMockState();

      const context: GroupOrchestrationContext = {
        phase: 'delegate',
        payload: {
          agentId: 'specialist-agent',
          task: 'Analyze the data and provide insights',
        },
      };

      const result = await supervisor.runner(context, state);

      expect(result).toEqual({
        payload: {
          agentId: 'specialist-agent',
          task: 'Analyze the data and provide insights',
        },
        type: 'delegate',
      });
    });
  });

  describe('runner - agent_spoke phase', () => {
    it('should return agent_spoke instruction with payload', async () => {
      const supervisor = new GroupOrchestrationSupervisor(defaultConfig);
      const state = createMockState();

      const context: GroupOrchestrationContext = {
        phase: 'agent_spoke',
        payload: {
          agentId: 'agent-1',
          completed: true,
        },
      };

      const result = await supervisor.runner(context, state);

      expect(result).toEqual({
        payload: {
          agentId: 'agent-1',
          completed: true,
        },
        type: 'agent_spoke',
      });
    });

    it('should handle agent_spoke with completed false', async () => {
      const supervisor = new GroupOrchestrationSupervisor(defaultConfig);
      const state = createMockState();

      const context: GroupOrchestrationContext = {
        phase: 'agent_spoke',
        payload: {
          agentId: 'agent-2',
          completed: false,
        },
      };

      const result = await supervisor.runner(context, state);

      expect(result.type).toBe('agent_spoke');
      expect((result as any).payload.completed).toBe(false);
    });
  });

  describe('runner - agents_broadcasted phase', () => {
    it('should return agents_broadcasted instruction with payload', async () => {
      const supervisor = new GroupOrchestrationSupervisor(defaultConfig);
      const state = createMockState();

      const context: GroupOrchestrationContext = {
        phase: 'agents_broadcasted',
        payload: {
          agentIds: ['agent-1', 'agent-2'],
          completed: true,
        },
      };

      const result = await supervisor.runner(context, state);

      expect(result).toEqual({
        payload: {
          agentIds: ['agent-1', 'agent-2'],
          completed: true,
        },
        type: 'agents_broadcasted',
      });
    });
  });

  describe('runner - unknown phase', () => {
    it('should return finish instruction with unknown_phase reason', async () => {
      const supervisor = new GroupOrchestrationSupervisor(defaultConfig);
      const state = createMockState();

      const context: GroupOrchestrationContext = {
        phase: 'unknown_phase_xyz',
        payload: {},
      };

      const result = await supervisor.runner(context, state);

      expect(result).toEqual({
        reason: 'unknown_phase',
        type: 'finish',
      });
    });

    it('should handle empty string phase', async () => {
      const supervisor = new GroupOrchestrationSupervisor(defaultConfig);
      const state = createMockState();

      const context: GroupOrchestrationContext = {
        phase: '',
        payload: {},
      };

      const result = await supervisor.runner(context, state);

      expect(result.type).toBe('finish');
      expect((result as any).reason).toBe('unknown_phase');
    });

    it('should handle custom phase not in switch cases', async () => {
      const supervisor = new GroupOrchestrationSupervisor(defaultConfig);
      const state = createMockState();

      const context: GroupOrchestrationContext = {
        phase: 'custom_phase',
        payload: { customData: 'test' },
      };

      const result = await supervisor.runner(context, state);

      expect(result.type).toBe('finish');
      expect((result as any).reason).toBe('unknown_phase');
    });
  });

  describe('runner - state parameter', () => {
    it('should not modify or use state (pure router)', async () => {
      const supervisor = new GroupOrchestrationSupervisor(defaultConfig);
      const state = createMockState();
      const originalState = { ...state };

      const context: GroupOrchestrationContext = {
        phase: 'speak',
        payload: { agentId: 'agent-1' },
      };

      await supervisor.runner(context, state);

      // State should remain unchanged
      expect(state.operationId).toBe(originalState.operationId);
      expect(state.status).toBe(originalState.status);
      expect(state.stepCount).toBe(originalState.stepCount);
    });
  });

  describe('IGroupOrchestrationSupervisor interface compliance', () => {
    it('should implement runner method that returns Promise<GroupOrchestrationInstruction>', async () => {
      const supervisor = new GroupOrchestrationSupervisor(defaultConfig);
      const state = createMockState();

      const context: GroupOrchestrationContext = {
        phase: 'call_supervisor',
        payload: { groupId: 'g1', round: 0 },
      };

      const result = supervisor.runner(context, state);

      // Should return a Promise
      expect(result).toBeInstanceOf(Promise);

      // Should resolve to an instruction
      const instruction = await result;
      expect(instruction).toHaveProperty('type');
    });
  });
});
