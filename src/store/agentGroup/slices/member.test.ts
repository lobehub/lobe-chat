import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { chatGroupService } from '@/services/chatGroup';

import { useAgentGroupStore } from '../store';

// Mock dependencies
vi.mock('@/services/chatGroup', () => ({
  chatGroupService: {
    addAgentsToGroup: vi.fn(),
    removeAgentsFromGroup: vi.fn(),
    updateAgentInGroup: vi.fn(),
  },
}));

vi.mock('swr', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...(actual as any),
    mutate: vi.fn().mockResolvedValue(undefined),
  };
});

describe('ChatGroupMemberSlice', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset store state
    act(() => {
      useAgentGroupStore.setState({
        groupMap: {},
        groups: [],
        groupsInit: false,
      });
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('addAgentsToGroup', () => {
    it('should add agents to a group', async () => {
      vi.mocked(chatGroupService.addAgentsToGroup).mockResolvedValue([]);

      const { result } = renderHook(() => useAgentGroupStore());

      await act(async () => {
        await result.current.addAgentsToGroup('group-1', ['agent-1', 'agent-2']);
      });

      expect(chatGroupService.addAgentsToGroup).toHaveBeenCalledWith('group-1', [
        'agent-1',
        'agent-2',
      ]);
    });

    it('should refresh group detail after adding agents', async () => {
      const { mutate } = await import('swr');
      vi.mocked(chatGroupService.addAgentsToGroup).mockResolvedValue([]);

      const { result } = renderHook(() => useAgentGroupStore());

      await act(async () => {
        await result.current.addAgentsToGroup('group-1', ['agent-1']);
      });

      expect(mutate).toHaveBeenCalledWith(['fetchGroupDetail', 'group-1']);
    });
  });

  describe('removeAgentFromGroup', () => {
    it('should remove an agent from a group', async () => {
      vi.mocked(chatGroupService.removeAgentsFromGroup).mockResolvedValue({
        deletedVirtualAgentIds: [],
        removedFromGroup: 1,
      });

      const { result } = renderHook(() => useAgentGroupStore());

      await act(async () => {
        await result.current.removeAgentFromGroup('group-1', 'agent-1');
      });

      expect(chatGroupService.removeAgentsFromGroup).toHaveBeenCalledWith('group-1', ['agent-1']);
    });

    it('should refresh group detail after removing agent', async () => {
      const { mutate } = await import('swr');
      vi.mocked(chatGroupService.removeAgentsFromGroup).mockResolvedValue({
        deletedVirtualAgentIds: [],
        removedFromGroup: 1,
      });

      const { result } = renderHook(() => useAgentGroupStore());

      await act(async () => {
        await result.current.removeAgentFromGroup('group-1', 'agent-1');
      });

      expect(mutate).toHaveBeenCalledWith(['fetchGroupDetail', 'group-1']);
    });
  });

  describe('reorderGroupMembers', () => {
    it('should reorder group members', async () => {
      vi.mocked(chatGroupService.updateAgentInGroup).mockResolvedValue({} as any);

      const { result } = renderHook(() => useAgentGroupStore());

      await act(async () => {
        await result.current.reorderGroupMembers('group-1', ['agent-2', 'agent-1', 'agent-3']);
      });

      expect(chatGroupService.updateAgentInGroup).toHaveBeenCalledTimes(3);
      expect(chatGroupService.updateAgentInGroup).toHaveBeenNthCalledWith(1, 'group-1', 'agent-2', {
        order: 0,
      });
      expect(chatGroupService.updateAgentInGroup).toHaveBeenNthCalledWith(2, 'group-1', 'agent-1', {
        order: 1,
      });
      expect(chatGroupService.updateAgentInGroup).toHaveBeenNthCalledWith(3, 'group-1', 'agent-3', {
        order: 2,
      });
    });

    it('should refresh group detail after reordering', async () => {
      const { mutate } = await import('swr');
      vi.mocked(chatGroupService.updateAgentInGroup).mockResolvedValue({} as any);

      const { result } = renderHook(() => useAgentGroupStore());

      await act(async () => {
        await result.current.reorderGroupMembers('group-1', ['agent-1', 'agent-2']);
      });

      expect(mutate).toHaveBeenCalledWith(['fetchGroupDetail', 'group-1']);
    });
  });
});
