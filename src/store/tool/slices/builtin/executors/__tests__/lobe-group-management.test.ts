import { describe, expect, it, vi } from 'vitest';

import type {
  AfterCompletionCallback,
  BuiltinToolContext,
  GroupOrchestrationCallbacks,
} from '../../types';
import { groupManagement } from '../lobe-group-management';

describe('GroupManagementExecutor', () => {
  const createMockContext = (
    groupOrchestration?: GroupOrchestrationCallbacks,
    agentId?: string,
    registerAfterCompletion?: (callback: AfterCompletionCallback) => void,
  ): BuiltinToolContext => ({
    agentId,
    groupOrchestration,
    messageId: 'test-message-id',
    operationId: 'test-operation-id',
    registerAfterCompletion,
  });

  describe('speak', () => {
    it('should return stop=true to terminate supervisor execution', async () => {
      const ctx = createMockContext();

      const result = await groupManagement.speak(
        { agentId: 'agent-1', instruction: 'Please respond' },
        ctx,
      );

      expect(result.success).toBe(true);
      expect(result.stop).toBe(true);
      expect(result.state).toEqual({
        agentId: 'agent-1',
        instruction: 'Please respond',
        type: 'speak',
      });
    });

    it('should register afterCompletion callback that triggers groupOrchestration.triggerSpeak', async () => {
      const triggerSpeak = vi.fn();
      const registeredCallbacks: AfterCompletionCallback[] = [];
      const registerAfterCompletion = vi.fn((cb: AfterCompletionCallback) => {
        registeredCallbacks.push(cb);
      });

      const ctx = createMockContext(
        {
          triggerBroadcast: vi.fn(),
          triggerDelegate: vi.fn(),
          triggerSpeak,
        },
        'supervisor-agent',
        registerAfterCompletion,
      );

      await groupManagement.speak({ agentId: 'agent-1', instruction: 'Please respond' }, ctx);

      // Verify registerAfterCompletion was called
      expect(registerAfterCompletion).toHaveBeenCalled();
      expect(registeredCallbacks.length).toBe(1);

      // Execute the registered callback (simulating AgentRuntime completion)
      await registeredCallbacks[0]();

      // Now triggerSpeak should have been called
      expect(triggerSpeak).toHaveBeenCalledWith({
        agentId: 'agent-1',
        instruction: 'Please respond',
        supervisorAgentId: 'supervisor-agent',
      });
    });

    it('should not fail when groupOrchestration is not available', async () => {
      const ctx = createMockContext(); // No groupOrchestration

      const result = await groupManagement.speak({ agentId: 'agent-1' }, ctx);

      expect(result.success).toBe(true);
      expect(result.stop).toBe(true);
    });

    it('should handle undefined instruction in afterCompletion callback', async () => {
      const triggerSpeak = vi.fn();
      const registeredCallbacks: AfterCompletionCallback[] = [];
      const registerAfterCompletion = vi.fn((cb: AfterCompletionCallback) => {
        registeredCallbacks.push(cb);
      });

      const ctx = createMockContext(
        {
          triggerBroadcast: vi.fn(),
          triggerDelegate: vi.fn(),
          triggerSpeak,
        },
        'supervisor-agent',
        registerAfterCompletion,
      );

      await groupManagement.speak({ agentId: 'agent-2' }, ctx);

      // Execute the registered callback
      await registeredCallbacks[0]();

      expect(triggerSpeak).toHaveBeenCalledWith({
        agentId: 'agent-2',
        instruction: undefined,
        supervisorAgentId: 'supervisor-agent',
      });
    });
  });

  describe('broadcast', () => {
    it('should return stop=true to terminate supervisor execution', async () => {
      const ctx = createMockContext();

      const result = await groupManagement.broadcast(
        { agentIds: ['agent-1', 'agent-2'], instruction: 'Discuss' },
        ctx,
      );

      expect(result.success).toBe(true);
      expect(result.stop).toBe(true);
      expect(result.state).toEqual({
        agentIds: ['agent-1', 'agent-2'],
        instruction: 'Discuss',
        type: 'broadcast',
      });
    });

    it('should register afterCompletion callback that triggers groupOrchestration.triggerBroadcast', async () => {
      const triggerBroadcast = vi.fn();
      const registeredCallbacks: AfterCompletionCallback[] = [];
      const registerAfterCompletion = vi.fn((cb: AfterCompletionCallback) => {
        registeredCallbacks.push(cb);
      });

      const ctx = createMockContext(
        {
          triggerBroadcast,
          triggerDelegate: vi.fn(),
          triggerSpeak: vi.fn(),
        },
        'supervisor-agent',
        registerAfterCompletion,
      );

      await groupManagement.broadcast(
        { agentIds: ['agent-1', 'agent-2'], instruction: 'Discuss together' },
        ctx,
      );

      // Verify registerAfterCompletion was called
      expect(registerAfterCompletion).toHaveBeenCalled();
      expect(registeredCallbacks.length).toBe(1);

      // Execute the registered callback (simulating AgentRuntime completion)
      await registeredCallbacks[0]();

      // Now triggerBroadcast should have been called
      expect(triggerBroadcast).toHaveBeenCalledWith({
        agentIds: ['agent-1', 'agent-2'],
        instruction: 'Discuss together',
        supervisorAgentId: 'supervisor-agent',
      });
    });

    it('should not fail when groupOrchestration is not available', async () => {
      const ctx = createMockContext();

      const result = await groupManagement.broadcast({ agentIds: ['agent-1'] }, ctx);

      expect(result.success).toBe(true);
      expect(result.stop).toBe(true);
    });
  });

  describe('delegate', () => {
    it('should return stop=true to terminate supervisor execution', async () => {
      const ctx = createMockContext();

      const result = await groupManagement.delegate(
        { agentId: 'agent-1', reason: 'User requested' },
        ctx,
      );

      expect(result.success).toBe(true);
      expect(result.stop).toBe(true);
      expect(result.state).toEqual({
        agentId: 'agent-1',
        reason: 'User requested',
        type: 'delegate',
      });
    });

    it('should register afterCompletion callback that triggers groupOrchestration.triggerDelegate', async () => {
      const triggerDelegate = vi.fn();
      const registeredCallbacks: AfterCompletionCallback[] = [];
      const registerAfterCompletion = vi.fn((cb: AfterCompletionCallback) => {
        registeredCallbacks.push(cb);
      });

      const ctx = createMockContext(
        {
          triggerBroadcast: vi.fn(),
          triggerDelegate,
          triggerSpeak: vi.fn(),
        },
        'supervisor-agent',
        registerAfterCompletion,
      );

      await groupManagement.delegate({ agentId: 'agent-3', reason: 'Expert needed' }, ctx);

      // Verify registerAfterCompletion was called
      expect(registerAfterCompletion).toHaveBeenCalled();
      expect(registeredCallbacks.length).toBe(1);

      // Execute the registered callback (simulating AgentRuntime completion)
      await registeredCallbacks[0]();

      // Now triggerDelegate should have been called
      expect(triggerDelegate).toHaveBeenCalledWith({
        agentId: 'agent-3',
        reason: 'Expert needed',
        supervisorAgentId: 'supervisor-agent',
      });
    });

    it('should not fail when groupOrchestration is not available', async () => {
      const ctx = createMockContext();

      const result = await groupManagement.delegate({ agentId: 'agent-1' }, ctx);

      expect(result.success).toBe(true);
      expect(result.stop).toBe(true);
    });
  });

  describe('other tools (no stop behavior)', () => {
    it('searchAgent should not return stop=true', async () => {
      const ctx = createMockContext();

      const result = await groupManagement.searchAgent({ query: 'test' }, ctx);

      expect(result.success).toBe(true);
      expect(result.stop).toBeUndefined();
    });

    it('getAgentInfo should return error when no groupId in context', async () => {
      const ctx = createMockContext();

      const result = await groupManagement.getAgentInfo({ agentId: 'agent-1' }, ctx);

      // No groupId means we can't get agent info
      expect(result.success).toBe(false);
      expect(result.stop).toBeUndefined();
    });
  });
});
