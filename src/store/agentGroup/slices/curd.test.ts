import { AgentGroupDetail } from '@lobechat/types';
import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { DEFAULT_CHAT_GROUP_CHAT_CONFIG } from '@/const/settings';
import { chatGroupService } from '@/services/chatGroup';

import { useAgentGroupStore } from '../store';

// Mock dependencies
vi.mock('@/services/chatGroup', () => ({
  chatGroupService: {
    updateGroup: vi.fn(),
  },
}));

vi.mock('swr', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...(actual as any),
    mutate: vi.fn().mockResolvedValue(undefined),
  };
});

// Helper to create mock AgentGroupDetail
const createMockGroup = (overrides: Partial<AgentGroupDetail>): AgentGroupDetail => ({
  agents: [],
  createdAt: new Date(),
  id: 'group-1',
  supervisorAgentId: 'supervisor-1',
  title: 'Test Group',
  updatedAt: new Date(),
  userId: 'user-1',
  ...overrides,
});

describe('ChatGroupCurdSlice', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset store state
    act(() => {
      useAgentGroupStore.setState({
        activeGroupId: 'group-1',
        groupMap: {
          'group-1': createMockGroup({ id: 'group-1', title: 'Test Group' }),
        },
        groups: [],
        groupsInit: true,
      });
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('pinGroup', () => {
    it('should pin a group', async () => {
      vi.mocked(chatGroupService.updateGroup).mockResolvedValue({} as any);

      const { result } = renderHook(() => useAgentGroupStore());

      await act(async () => {
        await result.current.pinGroup('group-1', true);
      });

      expect(chatGroupService.updateGroup).toHaveBeenCalledWith('group-1', { pinned: true });
    });

    it('should unpin a group', async () => {
      vi.mocked(chatGroupService.updateGroup).mockResolvedValue({} as any);

      const { result } = renderHook(() => useAgentGroupStore());

      await act(async () => {
        await result.current.pinGroup('group-1', false);
      });

      expect(chatGroupService.updateGroup).toHaveBeenCalledWith('group-1', { pinned: false });
    });

    it('should refresh group detail after pinning', async () => {
      const { mutate } = await import('swr');
      vi.mocked(chatGroupService.updateGroup).mockResolvedValue({} as any);

      const { result } = renderHook(() => useAgentGroupStore());

      await act(async () => {
        await result.current.pinGroup('group-1', true);
      });

      expect(mutate).toHaveBeenCalledWith(['fetchGroupDetail', 'group-1']);
    });
  });

  describe('updateGroup', () => {
    it('should update group properties', async () => {
      vi.mocked(chatGroupService.updateGroup).mockResolvedValue({} as any);

      const { result } = renderHook(() => useAgentGroupStore());

      await act(async () => {
        await result.current.updateGroup('group-1', { title: 'Updated Title' });
      });

      expect(chatGroupService.updateGroup).toHaveBeenCalledWith('group-1', {
        title: 'Updated Title',
      });
    });

    it('should refresh group detail after update', async () => {
      const { mutate } = await import('swr');
      vi.mocked(chatGroupService.updateGroup).mockResolvedValue({} as any);

      const { result } = renderHook(() => useAgentGroupStore());

      await act(async () => {
        await result.current.updateGroup('group-1', { description: 'New description' });
      });

      expect(mutate).toHaveBeenCalledWith(['fetchGroupDetail', 'group-1']);
    });
  });

  describe('updateGroupConfig', () => {
    it('should update group config with merged defaults', async () => {
      vi.mocked(chatGroupService.updateGroup).mockResolvedValue({} as any);

      const { result } = renderHook(() => useAgentGroupStore());

      await act(async () => {
        await result.current.updateGroupConfig({ enableSupervisor: false });
      });

      expect(chatGroupService.updateGroup).toHaveBeenCalledWith('group-1', {
        config: expect.objectContaining({
          ...DEFAULT_CHAT_GROUP_CHAT_CONFIG,
          enableSupervisor: false,
        }),
      });
    });

    it('should not update if no current group', async () => {
      act(() => {
        useAgentGroupStore.setState({
          activeGroupId: undefined,
          groupMap: {},
        });
      });

      const { result } = renderHook(() => useAgentGroupStore());

      await act(async () => {
        await result.current.updateGroupConfig({ enableSupervisor: false });
      });

      expect(chatGroupService.updateGroup).not.toHaveBeenCalled();
    });

    it('should refresh group detail after config update', async () => {
      const { mutate } = await import('swr');
      vi.mocked(chatGroupService.updateGroup).mockResolvedValue({} as any);

      const { result } = renderHook(() => useAgentGroupStore());

      await act(async () => {
        await result.current.updateGroupConfig({ scene: 'casual' });
      });

      expect(mutate).toHaveBeenCalledWith(['fetchGroupDetail', 'group-1']);
    });
  });

  describe('updateGroupMeta', () => {
    it('should update group meta', async () => {
      vi.mocked(chatGroupService.updateGroup).mockResolvedValue({} as any);

      const { result } = renderHook(() => useAgentGroupStore());

      await act(async () => {
        await result.current.updateGroupMeta({ title: 'New Title', description: 'New Desc' });
      });

      expect(chatGroupService.updateGroup).toHaveBeenCalledWith('group-1', {
        description: 'New Desc',
        title: 'New Title',
      });
    });

    it('should not update if no current group', async () => {
      act(() => {
        useAgentGroupStore.setState({
          activeGroupId: undefined,
          groupMap: {},
        });
      });

      const { result } = renderHook(() => useAgentGroupStore());

      await act(async () => {
        await result.current.updateGroupMeta({ title: 'New Title' });
      });

      expect(chatGroupService.updateGroup).not.toHaveBeenCalled();
    });

    it('should refresh group detail after meta update', async () => {
      const { mutate } = await import('swr');
      vi.mocked(chatGroupService.updateGroup).mockResolvedValue({} as any);

      const { result } = renderHook(() => useAgentGroupStore());

      await act(async () => {
        await result.current.updateGroupMeta({ title: 'Updated' });
      });

      expect(mutate).toHaveBeenCalledWith(['fetchGroupDetail', 'group-1']);
    });
  });
});
