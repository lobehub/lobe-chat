import { describe, expect, it, vi } from 'vitest';

import type {
  AgentState,
  GroupOrchestrationContext,
  GroupOrchestrationExecutor,
  GroupOrchestrationInstruction,
  GroupOrchestrationRuntimeConfig,
  IGroupOrchestrationSupervisor,
} from '../../types';
import { GroupOrchestrationRuntime } from '../GroupOrchestrationRuntime';

// Mock Supervisor for testing
class MockSupervisor implements IGroupOrchestrationSupervisor {
  async runner(
    context: GroupOrchestrationContext,
    _state: AgentState,
  ): Promise<GroupOrchestrationInstruction> {
    switch (context.phase) {
      case 'call_supervisor':
        return {
          type: 'speak',
          payload: {
            agentId: 'agent-1',
            instruction: 'Please respond',
          },
        };
      case 'agent_spoke':
        return {
          type: 'finish',
          reason: 'Task completed',
        };
      default:
        return {
          type: 'finish',
          reason: 'Unknown phase',
        };
    }
  }
}

// Helper function to create test context
function createTestContext(
  phase: GroupOrchestrationContext['phase'],
  payload?: Record<string, unknown>,
  operationId?: string,
): GroupOrchestrationContext {
  return {
    phase,
    payload,
    operationId,
  };
}

// Helper function to create mock executors
function createMockExecutors(): Partial<
  Record<GroupOrchestrationInstruction['type'], GroupOrchestrationExecutor>
> {
  return {
    speak: vi.fn().mockImplementation(async (instruction, state) => ({
      events: [{ type: 'agent_spoke', agentId: (instruction as any).payload.agentId }],
      newState: state,
      nextContext: {
        phase: 'agent_spoke',
        payload: { agentId: (instruction as any).payload.agentId, completed: true },
      },
    })),
    broadcast: vi.fn().mockImplementation(async (instruction, state) => ({
      events: [{ type: 'agents_broadcasted', agentIds: (instruction as any).payload.agentIds }],
      newState: state,
      nextContext: {
        phase: 'agents_broadcasted',
        payload: { agentIds: (instruction as any).payload.agentIds, completed: true },
      },
    })),
    finish: vi.fn().mockImplementation(async (instruction, state) => ({
      events: [{ type: 'done', reason: (instruction as any).reason }],
      newState: { ...state, status: 'done' },
      nextContext: undefined,
    })),
    call_supervisor: vi.fn().mockImplementation(async (_instruction, state) => ({
      events: [{ type: 'supervisor_finished' }],
      newState: { ...state, status: 'done' },
      nextContext: undefined,
    })),
    agent_spoke: vi.fn().mockImplementation(async (_instruction, state) => ({
      events: [],
      newState: state,
      nextContext: {
        phase: 'call_supervisor',
        payload: { round: 1 },
      },
    })),
    agents_broadcasted: vi.fn().mockImplementation(async (_instruction, state) => ({
      events: [],
      newState: state,
      nextContext: {
        phase: 'call_supervisor',
        payload: { round: 1 },
      },
    })),
  };
}

describe('GroupOrchestrationRuntime', () => {
  describe('Constructor', () => {
    it('should create runtime with supervisor and config', () => {
      const supervisor = new MockSupervisor();
      const executors = createMockExecutors();
      const config: GroupOrchestrationRuntimeConfig = {
        executors,
        operationId: 'test-operation',
      };

      const runtime = new GroupOrchestrationRuntime(supervisor, config);

      expect(runtime).toBeDefined();
    });

    it('should store operationId and getOperation from config', () => {
      const supervisor = new MockSupervisor();
      const executors = createMockExecutors();
      const mockGetOperation = vi.fn().mockReturnValue({
        abortController: new AbortController(),
        context: { key: 'value' },
      });

      const config: GroupOrchestrationRuntimeConfig = {
        executors,
        operationId: 'test-op-123',
        getOperation: mockGetOperation,
      };

      const runtime = new GroupOrchestrationRuntime(supervisor, config);

      // Access context through public method
      const context = runtime.getContext();
      expect(context).toEqual({ key: 'value' });
      expect(mockGetOperation).toHaveBeenCalledWith('test-op-123');
    });
  });

  describe('step method', () => {
    it('should increment stepCount on each step', async () => {
      const supervisor = new MockSupervisor();
      const executors = createMockExecutors();
      const config: GroupOrchestrationRuntimeConfig = { executors };

      const runtime = new GroupOrchestrationRuntime(supervisor, config);
      const state = GroupOrchestrationRuntime.createInitialState({ operationId: 'test' });

      expect(state.stepCount).toBe(0);

      const result = await runtime.step(state, createTestContext('call_supervisor'));

      expect(result.newState.stepCount).toBe(1);
    });

    it('should update lastModified on each step', async () => {
      const supervisor = new MockSupervisor();
      const executors = createMockExecutors();
      const config: GroupOrchestrationRuntimeConfig = { executors };

      const runtime = new GroupOrchestrationRuntime(supervisor, config);
      const state = GroupOrchestrationRuntime.createInitialState({ operationId: 'test' });

      const originalLastModified = state.lastModified;

      // Small delay to ensure time difference
      await new Promise((resolve) => setTimeout(resolve, 10));

      const result = await runtime.step(state, createTestContext('call_supervisor'));

      expect(result.newState.lastModified).not.toBe(originalLastModified);
    });

    it('should respect maxSteps limit', async () => {
      const supervisor = new MockSupervisor();
      const executors = createMockExecutors();
      const config: GroupOrchestrationRuntimeConfig = { executors };

      const runtime = new GroupOrchestrationRuntime(supervisor, config);
      const state = GroupOrchestrationRuntime.createInitialState({
        operationId: 'test',
        maxSteps: 2,
        stepCount: 2, // Already at limit
      });

      const result = await runtime.step(state, createTestContext('call_supervisor'));

      expect(result.newState.status).toBe('done');
      expect(result.events).toHaveLength(1);
      expect(result.events[0]).toMatchObject({
        type: 'done',
        reason: 'Maximum steps exceeded: 2',
      });
      expect(result.nextContext).toBeUndefined();
    });

    it('should call supervisor runner to get instruction', async () => {
      const supervisor = new MockSupervisor();
      const runnerSpy = vi.spyOn(supervisor, 'runner');
      const executors = createMockExecutors();
      const config: GroupOrchestrationRuntimeConfig = { executors };

      const runtime = new GroupOrchestrationRuntime(supervisor, config);
      const state = GroupOrchestrationRuntime.createInitialState({ operationId: 'test' });
      const context = createTestContext('call_supervisor', { round: 0 });

      await runtime.step(state, context);

      expect(runnerSpy).toHaveBeenCalledWith(context, expect.objectContaining({ stepCount: 1 }));
    });

    it('should execute correct executor based on instruction type', async () => {
      const supervisor = new MockSupervisor();
      const executors = createMockExecutors();
      const config: GroupOrchestrationRuntimeConfig = { executors };

      const runtime = new GroupOrchestrationRuntime(supervisor, config);
      const state = GroupOrchestrationRuntime.createInitialState({ operationId: 'test' });

      // call_supervisor phase returns 'speak' instruction
      await runtime.step(state, createTestContext('call_supervisor'));

      expect(executors.speak).toHaveBeenCalled();
    });

    it('should throw error when executor not found for instruction type', async () => {
      const supervisor = new MockSupervisor();
      supervisor.runner = vi.fn().mockResolvedValue({
        type: 'unknown_instruction' as any,
        payload: {},
      });

      const executors = createMockExecutors();
      const config: GroupOrchestrationRuntimeConfig = { executors };

      const runtime = new GroupOrchestrationRuntime(supervisor, config);
      const state = GroupOrchestrationRuntime.createInitialState({ operationId: 'test' });

      await expect(runtime.step(state, createTestContext('call_supervisor'))).rejects.toThrow(
        'No executor found for instruction type: unknown_instruction',
      );
    });

    it('should preserve stepCount and lastModified after executor execution', async () => {
      const supervisor = new MockSupervisor();
      const executors: Partial<
        Record<GroupOrchestrationInstruction['type'], GroupOrchestrationExecutor>
      > = {
        speak: vi.fn().mockImplementation(async (_instruction, state) => ({
          events: [],
          // Executor might modify stepCount/lastModified incorrectly
          newState: { ...state, stepCount: 999, lastModified: 'wrong-date' },
          nextContext: undefined,
        })),
      };
      const config: GroupOrchestrationRuntimeConfig = { executors };

      const runtime = new GroupOrchestrationRuntime(supervisor, config);
      const state = GroupOrchestrationRuntime.createInitialState({ operationId: 'test' });

      const result = await runtime.step(state, createTestContext('call_supervisor'));

      // stepCount and lastModified should be preserved from runtime, not executor
      expect(result.newState.stepCount).toBe(1);
      expect(result.newState.lastModified).not.toBe('wrong-date');
    });

    it('should pass through events from executor', async () => {
      const supervisor = new MockSupervisor();
      const customEvents = [
        { type: 'agent_spoke' as const, agentId: 'agent-1' },
        { type: 'done' as const, reason: 'test' },
      ];
      const executors: Partial<
        Record<GroupOrchestrationInstruction['type'], GroupOrchestrationExecutor>
      > = {
        speak: vi.fn().mockResolvedValue({
          events: customEvents,
          newState: {} as AgentState,
          nextContext: undefined,
        }),
      };
      const config: GroupOrchestrationRuntimeConfig = { executors };

      const runtime = new GroupOrchestrationRuntime(supervisor, config);
      const state = GroupOrchestrationRuntime.createInitialState({ operationId: 'test' });

      const result = await runtime.step(state, createTestContext('call_supervisor'));

      expect(result.events).toEqual(customEvents);
    });
  });

  describe('getContext method', () => {
    it('should return undefined when no operationId', () => {
      const supervisor = new MockSupervisor();
      const executors = createMockExecutors();
      const config: GroupOrchestrationRuntimeConfig = { executors };

      const runtime = new GroupOrchestrationRuntime(supervisor, config);

      expect(runtime.getContext()).toBeUndefined();
    });

    it('should return undefined when no getOperation function', () => {
      const supervisor = new MockSupervisor();
      const executors = createMockExecutors();
      const config: GroupOrchestrationRuntimeConfig = {
        executors,
        operationId: 'test-op',
        // No getOperation
      };

      const runtime = new GroupOrchestrationRuntime(supervisor, config);

      expect(runtime.getContext()).toBeUndefined();
    });

    it('should return context from getOperation', () => {
      const supervisor = new MockSupervisor();
      const executors = createMockExecutors();
      const expectedContext = { groupId: 'group-1', topicId: 'topic-1' };
      const config: GroupOrchestrationRuntimeConfig = {
        executors,
        operationId: 'test-op',
        getOperation: vi.fn().mockReturnValue({
          abortController: new AbortController(),
          context: expectedContext,
        }),
      };

      const runtime = new GroupOrchestrationRuntime(supervisor, config);

      expect(runtime.getContext()).toEqual(expectedContext);
    });
  });

  describe('getAbortController method', () => {
    it('should return undefined when no operationId', () => {
      const supervisor = new MockSupervisor();
      const executors = createMockExecutors();
      const config: GroupOrchestrationRuntimeConfig = { executors };

      const runtime = new GroupOrchestrationRuntime(supervisor, config);

      expect(runtime.getAbortController()).toBeUndefined();
    });

    it('should return undefined when no getOperation function', () => {
      const supervisor = new MockSupervisor();
      const executors = createMockExecutors();
      const config: GroupOrchestrationRuntimeConfig = {
        executors,
        operationId: 'test-op',
      };

      const runtime = new GroupOrchestrationRuntime(supervisor, config);

      expect(runtime.getAbortController()).toBeUndefined();
    });

    it('should return abortController from getOperation', () => {
      const supervisor = new MockSupervisor();
      const executors = createMockExecutors();
      const expectedController = new AbortController();
      const config: GroupOrchestrationRuntimeConfig = {
        executors,
        operationId: 'test-op',
        getOperation: vi.fn().mockReturnValue({
          abortController: expectedController,
          context: {},
        }),
      };

      const runtime = new GroupOrchestrationRuntime(supervisor, config);

      expect(runtime.getAbortController()).toBe(expectedController);
    });
  });

  describe('createInitialState static method', () => {
    it('should create state with default values', () => {
      const state = GroupOrchestrationRuntime.createInitialState({ operationId: 'test' });

      expect(state).toMatchObject({
        operationId: 'test',
        status: 'idle',
        messages: [],
        stepCount: 0,
        createdAt: expect.any(String),
        lastModified: expect.any(String),
        toolManifestMap: {},
      });
    });

    it('should include default usage statistics', () => {
      const state = GroupOrchestrationRuntime.createInitialState({ operationId: 'test' });

      expect(state.usage).toMatchObject({
        llm: {
          tokens: { input: 0, output: 0, total: 0 },
          apiCalls: 0,
          processingTimeMs: 0,
        },
        tools: {
          totalCalls: 0,
          byTool: [],
          totalTimeMs: 0,
        },
        humanInteraction: {
          approvalRequests: 0,
          promptRequests: 0,
          selectRequests: 0,
          totalWaitingTimeMs: 0,
        },
      });
    });

    it('should include default cost statistics', () => {
      const state = GroupOrchestrationRuntime.createInitialState({ operationId: 'test' });

      expect(state.cost).toMatchObject({
        llm: {
          byModel: [],
          total: 0,
          currency: 'USD',
        },
        tools: {
          byTool: [],
          total: 0,
          currency: 'USD',
        },
        total: 0,
        currency: 'USD',
        calculatedAt: expect.any(String),
      });
    });

    it('should allow overriding partial state', () => {
      const state = GroupOrchestrationRuntime.createInitialState({
        operationId: 'test',
        maxSteps: 20,
        stepCount: 5,
      });

      expect(state.operationId).toBe('test');
      expect(state.maxSteps).toBe(20);
      expect(state.stepCount).toBe(5);
    });

    it('should set createdAt and lastModified to same timestamp', () => {
      const state = GroupOrchestrationRuntime.createInitialState({ operationId: 'test' });

      expect(state.createdAt).toBe(state.lastModified);
    });

    it('should handle undefined partialState by using default operationId', () => {
      // This tests the fallback branch: ...(partialState || { operationId: '' })
      const state = GroupOrchestrationRuntime.createInitialState(undefined as any);

      expect(state.operationId).toBe('');
      expect(state.status).toBe('idle');
      expect(state.messages).toEqual([]);
    });
  });

  describe('Integration: Full Orchestration Loop', () => {
    it('should complete a simple orchestration flow', async () => {
      // Create supervisor that follows: call_supervisor -> speak -> agent_spoke -> finish
      const supervisor: IGroupOrchestrationSupervisor = {
        runner: vi.fn().mockImplementation(async (context: GroupOrchestrationContext) => {
          switch (context.phase) {
            case 'call_supervisor':
              return {
                type: 'speak',
                payload: { agentId: 'agent-1', instruction: 'Respond to user' },
              };
            case 'agent_spoke':
              return {
                type: 'finish',
                reason: 'Task completed successfully',
              };
            default:
              return { type: 'finish', reason: 'Unknown phase' };
          }
        }),
      };

      const executors = createMockExecutors();
      const config: GroupOrchestrationRuntimeConfig = { executors };
      const runtime = new GroupOrchestrationRuntime(supervisor, config);

      // Step 1: call_supervisor -> speak
      let state = GroupOrchestrationRuntime.createInitialState({ operationId: 'test' });
      let result = await runtime.step(state, createTestContext('call_supervisor'));

      expect(executors.speak).toHaveBeenCalled();
      expect(result.nextContext?.phase).toBe('agent_spoke');

      // Step 2: agent_spoke -> finish
      result = await runtime.step(result.newState, result.nextContext as GroupOrchestrationContext);

      expect(executors.finish).toHaveBeenCalled();
      expect(result.newState.status).toBe('done');
      expect(result.nextContext).toBeUndefined();
    });

    it('should handle broadcast orchestration flow', async () => {
      const supervisor: IGroupOrchestrationSupervisor = {
        runner: vi.fn().mockImplementation(async (context: GroupOrchestrationContext) => {
          switch (context.phase) {
            case 'call_supervisor':
              return {
                type: 'broadcast',
                payload: { agentIds: ['agent-1', 'agent-2'], instruction: 'Discuss topic' },
              };
            case 'agents_broadcasted':
              return {
                type: 'finish',
                reason: 'All agents responded',
              };
            default:
              return { type: 'finish', reason: 'Unknown phase' };
          }
        }),
      };

      const executors = createMockExecutors();
      const config: GroupOrchestrationRuntimeConfig = { executors };
      const runtime = new GroupOrchestrationRuntime(supervisor, config);

      // Step 1: call_supervisor -> broadcast
      let state = GroupOrchestrationRuntime.createInitialState({ operationId: 'test' });
      let result = await runtime.step(state, createTestContext('call_supervisor'));

      expect(executors.broadcast).toHaveBeenCalled();
      expect(result.nextContext?.phase).toBe('agents_broadcasted');

      // Step 2: agents_broadcasted -> finish
      result = await runtime.step(result.newState, result.nextContext as GroupOrchestrationContext);

      expect(executors.finish).toHaveBeenCalled();
      expect(result.newState.status).toBe('done');
    });

    it('should handle multi-round orchestration', async () => {
      let round = 0;
      const supervisor: IGroupOrchestrationSupervisor = {
        runner: vi.fn().mockImplementation(async (context: GroupOrchestrationContext) => {
          if (context.phase === 'call_supervisor') {
            round++;
            if (round < 3) {
              return {
                type: 'speak',
                payload: { agentId: `agent-${round}`, instruction: `Round ${round}` },
              };
            }
            return { type: 'finish', reason: 'Max rounds reached' };
          }
          // For agent_spoke phase, supervisor doesn't get called directly
          // The mock executor handles the transition
          return { type: 'finish', reason: 'Unknown phase' };
        }),
      };

      // Custom executors that properly loop back to call_supervisor
      const executors: Partial<
        Record<GroupOrchestrationInstruction['type'], GroupOrchestrationExecutor>
      > = {
        speak: vi.fn().mockImplementation(async (instruction, state) => ({
          events: [{ type: 'agent_spoke', agentId: (instruction as any).payload.agentId }],
          newState: state,
          nextContext: {
            phase: 'call_supervisor', // Loop back to supervisor
            payload: { round },
          },
        })),
        finish: vi.fn().mockImplementation(async (instruction, state) => ({
          events: [{ type: 'done', reason: (instruction as any).reason }],
          newState: { ...state, status: 'done' },
          nextContext: undefined,
        })),
      };

      const config: GroupOrchestrationRuntimeConfig = { executors };
      const runtime = new GroupOrchestrationRuntime(supervisor, config);

      let state = GroupOrchestrationRuntime.createInitialState({ operationId: 'test' });
      let context: GroupOrchestrationContext | undefined = createTestContext('call_supervisor');

      // Run until done or max steps
      let stepCount = 0;
      while (state.status !== 'done' && stepCount < 20 && context) {
        const result = await runtime.step(state, context);
        state = result.newState;
        context = result.nextContext;
        stepCount++;
      }

      expect(state.status).toBe('done');
      expect(round).toBe(3);
      // Verify speak was called twice (round 1 and 2)
      expect(executors.speak).toHaveBeenCalledTimes(2);
      // Verify finish was called once (round 3)
      expect(executors.finish).toHaveBeenCalledTimes(1);
    });
  });
});
