import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { INBOX_SESSION_ID } from '@/const/session';
import { chatGroupService } from '@/services/chatGroup';

import { useAgentGroupStore } from '../store';

// Mock dependencies
vi.mock('@/services/chatGroup', () => ({
  chatGroupService: {
    addAgentsToGroup: vi.fn(),
    createGroup: vi.fn(),
    deleteGroup: vi.fn(),
    getGroupAgents: vi.fn(),
    getGroups: vi.fn(),
  },
}));

vi.mock('@/store/session', () => ({
  getSessionStoreState: vi.fn(() => ({
    activeId: 'some-session-id',
    refreshSessions: vi.fn().mockResolvedValue(undefined),
    removeSession: vi.fn().mockResolvedValue(undefined),
    sessions: [],
    switchSession: vi.fn(),
  })),
}));

describe('ChatGroupLifecycleSlice', () => {
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

  describe('createGroup', () => {
    it('should create a new group and switch to it', async () => {
      const mockGroup = {
        id: 'new-group-id',
        title: 'Test Group',
        userId: 'user-1',
      };

      vi.mocked(chatGroupService.createGroup).mockResolvedValue({
        group: mockGroup as any,
        supervisorAgentId: 'supervisor-1',
      });
      vi.mocked(chatGroupService.getGroups).mockResolvedValue([mockGroup as any]);

      const { result } = renderHook(() => useAgentGroupStore());

      let groupId: string = '';
      await act(async () => {
        groupId = await result.current.createGroup({ title: 'Test Group' });
      });

      expect(groupId).toBe('new-group-id');
      expect(chatGroupService.createGroup).toHaveBeenCalledWith({ title: 'Test Group' });
    });

    it('should add agents to group if provided', async () => {
      const mockGroup = {
        id: 'new-group-id',
        title: 'Test Group',
        userId: 'user-1',
      };

      vi.mocked(chatGroupService.createGroup).mockResolvedValue({
        group: mockGroup as any,
        supervisorAgentId: 'supervisor-1',
      });
      vi.mocked(chatGroupService.addAgentsToGroup).mockResolvedValue([]);
      vi.mocked(chatGroupService.getGroups).mockResolvedValue([mockGroup as any]);

      const { result } = renderHook(() => useAgentGroupStore());

      await act(async () => {
        await result.current.createGroup({ title: 'Test Group' }, ['agent-1', 'agent-2']);
      });

      expect(chatGroupService.addAgentsToGroup).toHaveBeenCalledWith('new-group-id', [
        'agent-1',
        'agent-2',
      ]);
    });

    it('should not switch session when silent is true', async () => {
      const mockSwitchSession = vi.fn();
      const { getSessionStoreState } = await import('@/store/session');
      vi.mocked(getSessionStoreState).mockReturnValue({
        activeId: 'some-session-id',
        refreshSessions: vi.fn().mockResolvedValue(undefined),
        sessions: [],
        switchSession: mockSwitchSession,
      } as any);

      const mockGroup = {
        id: 'new-group-id',
        title: 'Test Group',
        userId: 'user-1',
      };

      vi.mocked(chatGroupService.createGroup).mockResolvedValue({
        group: mockGroup as any,
        supervisorAgentId: 'supervisor-1',
      });
      vi.mocked(chatGroupService.getGroups).mockResolvedValue([mockGroup as any]);

      const { result } = renderHook(() => useAgentGroupStore());

      await act(async () => {
        await result.current.createGroup({ title: 'Test Group' }, [], true);
      });

      expect(mockSwitchSession).not.toHaveBeenCalled();
    });
  });

  describe('deleteGroup', () => {
    it('should delete a group', async () => {
      vi.mocked(chatGroupService.getGroupAgents).mockResolvedValue([]);
      vi.mocked(chatGroupService.deleteGroup).mockResolvedValue({} as any);
      vi.mocked(chatGroupService.getGroups).mockResolvedValue([]);

      const { result } = renderHook(() => useAgentGroupStore());

      await act(async () => {
        await result.current.deleteGroup('group-to-delete');
      });

      expect(chatGroupService.deleteGroup).toHaveBeenCalledWith('group-to-delete');
    });

    it('should delete virtual agents when deleting group', async () => {
      const mockRemoveSession = vi.fn().mockResolvedValue(undefined);
      const { getSessionStoreState } = await import('@/store/session');
      vi.mocked(getSessionStoreState).mockReturnValue({
        activeId: 'other-session',
        refreshSessions: vi.fn().mockResolvedValue(undefined),
        removeSession: mockRemoveSession,
        sessions: [
          {
            config: { id: 'virtual-agent-id', virtual: true },
            id: 'virtual-session-id',
            type: 'agent',
          },
        ],
        switchSession: vi.fn(),
      } as any);

      vi.mocked(chatGroupService.getGroupAgents).mockResolvedValue([
        { agentId: 'virtual-agent-id', chatGroupId: 'group-id' },
      ] as any);
      vi.mocked(chatGroupService.deleteGroup).mockResolvedValue({} as any);
      vi.mocked(chatGroupService.getGroups).mockResolvedValue([]);

      const { result } = renderHook(() => useAgentGroupStore());

      await act(async () => {
        await result.current.deleteGroup('group-id');
      });

      expect(mockRemoveSession).toHaveBeenCalledWith('virtual-session-id');
    });

    it('should switch to inbox if deleted group is active', async () => {
      const mockSwitchSession = vi.fn();
      const { getSessionStoreState } = await import('@/store/session');
      vi.mocked(getSessionStoreState).mockReturnValue({
        activeId: 'group-to-delete',
        refreshSessions: vi.fn().mockResolvedValue(undefined),
        removeSession: vi.fn().mockResolvedValue(undefined),
        sessions: [],
        switchSession: mockSwitchSession,
      } as any);

      vi.mocked(chatGroupService.getGroupAgents).mockResolvedValue([]);
      vi.mocked(chatGroupService.deleteGroup).mockResolvedValue({} as any);
      vi.mocked(chatGroupService.getGroups).mockResolvedValue([]);

      const { result } = renderHook(() => useAgentGroupStore());

      await act(async () => {
        await result.current.deleteGroup('group-to-delete');
      });

      expect(mockSwitchSession).toHaveBeenCalledWith(INBOX_SESSION_ID);
    });
  });
});
