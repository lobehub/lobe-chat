import { describe, expect, it, vi } from 'vitest';

import type { BuiltinToolContext, GroupOrchestrationCallbacks } from '../../types';
import { groupManagement } from '../lobe-group-management';

describe('GroupManagementExecutor', () => {
  const createMockContext = (
    groupOrchestration?: GroupOrchestrationCallbacks,
    agentId?: string,
  ): BuiltinToolContext => ({
    agentId,
    groupOrchestration,
    messageId: 'test-message-id',
    operationId: 'test-operation-id',
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

    it('should trigger groupOrchestration.triggerSpeak when available', async () => {
      const triggerSpeak = vi.fn();
      const ctx = createMockContext(
        {
          triggerBroadcast: vi.fn(),
          triggerDelegate: vi.fn(),
          triggerSpeak,
        },
        'supervisor-agent',
      );

      await groupManagement.speak({ agentId: 'agent-1', instruction: 'Please respond' }, ctx);

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

    it('should handle undefined instruction', async () => {
      const triggerSpeak = vi.fn();
      const ctx = createMockContext(
        {
          triggerBroadcast: vi.fn(),
          triggerDelegate: vi.fn(),
          triggerSpeak,
        },
        'supervisor-agent',
      );

      await groupManagement.speak({ agentId: 'agent-2' }, ctx);

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

    it('should trigger groupOrchestration.triggerBroadcast when available', async () => {
      const triggerBroadcast = vi.fn();
      const ctx = createMockContext(
        {
          triggerBroadcast,
          triggerDelegate: vi.fn(),
          triggerSpeak: vi.fn(),
        },
        'supervisor-agent',
      );

      await groupManagement.broadcast(
        { agentIds: ['agent-1', 'agent-2'], instruction: 'Discuss together' },
        ctx,
      );

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

    it('should trigger groupOrchestration.triggerDelegate when available', async () => {
      const triggerDelegate = vi.fn();
      const ctx = createMockContext(
        {
          triggerBroadcast: vi.fn(),
          triggerDelegate,
          triggerSpeak: vi.fn(),
        },
        'supervisor-agent',
      );

      await groupManagement.delegate({ agentId: 'agent-3', reason: 'Expert needed' }, ctx);

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

    it('getAgentInfo should not return stop=true', async () => {
      const ctx = createMockContext();

      const result = await groupManagement.getAgentInfo({ agentId: 'agent-1' }, ctx);

      expect(result.success).toBe(true);
      expect(result.stop).toBeUndefined();
    });
  });
});
