import { act, renderHook } from '@testing-library/react';
import { router } from 'next/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { globalService } from '@/services/global';
import { useGlobalStore } from '@/store/global';
import { type Guide, SidebarTabKey } from '@/store/global/slices/common/initialState';

// Mock globalService
vi.mock('@/services/global', () => ({
  globalService: {
    getLatestVersion: vi.fn(),
    getGlobalConfig: vi.fn(),
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('createCommonSlice', () => {
  describe('switchBackToChat', () => {
    it('should switch back to chat', () => {
      const { result } = renderHook(() => useGlobalStore());
      const sessionId = 'session-id';
      const router = { push: vi.fn() } as any;

      act(() => {
        useGlobalStore.setState({ router });
        result.current.switchBackToChat(sessionId);
      });

      expect(router.push).toHaveBeenCalledWith('/chat?session=session-id');
    });
  });

  describe('switchSideBar', () => {
    it('should switch sidebar', () => {
      const { result } = renderHook(() => useGlobalStore());

      act(() => {
        result.current.switchSideBar(SidebarTabKey.Market);
      });

      expect(result.current.sidebarKey).toEqual(SidebarTabKey.Market);
    });
  });

  describe('toggleChatSideBar', () => {
    it('should toggle chat sidebar', () => {
      const { result } = renderHook(() => useGlobalStore());

      act(() => {
        useGlobalStore.getState().updatePreference({ showChatSideBar: false });
        result.current.toggleChatSideBar();
      });

      expect(result.current.preference.showChatSideBar).toBe(true);
    });

    // Add more tests for other actions in createCommonSlice
  });

  describe('toggleExpandSessionGroup', () => {
    it('should toggle expand session group', () => {
      const { result } = renderHook(() => useGlobalStore());
      const groupId = 'group-id';

      act(() => {
        result.current.toggleExpandSessionGroup(groupId, true);
      });

      expect(result.current.preference.expandSessionGroupKeys).toContain(groupId);
    });
  });

  describe('toggleMobileTopic', () => {
    it('should toggle mobile topic', () => {
      const { result } = renderHook(() => useGlobalStore());

      act(() => {
        result.current.toggleMobileTopic();
      });

      expect(result.current.preference.mobileShowTopic).toBe(true);
    });
  });

  describe('toggleSystemRole', () => {
    it('should toggle system role', () => {
      const { result } = renderHook(() => useGlobalStore());

      act(() => {
        result.current.toggleSystemRole(true);
      });

      expect(result.current.preference.showSystemRole).toBe(true);
    });
  });

  describe('updateGuideState', () => {
    it('should update guide state', () => {
      const { result } = renderHook(() => useGlobalStore());
      const guide: Guide = { topic: true };

      act(() => {
        result.current.updateGuideState(guide);
      });

      expect(result.current.preference.guide).toEqual(guide);
    });
  });

  describe('updatePreference', () => {
    it('should update preference', () => {
      const { result } = renderHook(() => useGlobalStore());
      const preference = { inputHeight: 200 };

      act(() => {
        result.current.updatePreference(preference);
      });

      expect(result.current.preference.inputHeight).toEqual(200);
    });
  });
});
