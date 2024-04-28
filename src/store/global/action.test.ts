import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { withSWR } from '~test-utils';

import { globalService } from '@/services/global';
import { useGlobalStore } from '@/store/global/index';

vi.mock('zustand/traditional');

vi.mock('@/utils/client/switchLang', () => ({
  switchLang: vi.fn(),
}));

vi.mock('swr', async (importOriginal) => {
  const modules = await importOriginal();
  return {
    ...(modules as any),
    mutate: vi.fn(),
  };
});

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('createPreferenceSlice', () => {
  describe('toggleChatSideBar', () => {
    it('should toggle chat sidebar', () => {
      const { result } = renderHook(() => useGlobalStore());

      act(() => {
        useGlobalStore.getState().updatePreference({ showChatSideBar: false });
        result.current.toggleChatSideBar();
      });

      expect(result.current.preference.showChatSideBar).toBe(true);
    });
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

  describe('useCheckLatestVersion', () => {
    it('should set hasNewVersion to false if there is no new version', async () => {
      const latestVersion = '0.0.1';

      vi.spyOn(globalService, 'getLatestVersion').mockResolvedValueOnce(latestVersion);

      const { result } = renderHook(() => useGlobalStore().useCheckLatestVersion(), {
        wrapper: withSWR,
      });

      await waitFor(() => {
        expect(result.current.data).toBe(latestVersion);
      });

      expect(useGlobalStore.getState().hasNewVersion).toBeUndefined();
      expect(useGlobalStore.getState().latestVersion).toBeUndefined();
    });

    it('should set hasNewVersion to true if there is a new version', async () => {
      const latestVersion = '10000000.0.0';

      vi.spyOn(globalService, 'getLatestVersion').mockResolvedValueOnce(latestVersion);

      const { result } = renderHook(() => useGlobalStore().useCheckLatestVersion(), {
        wrapper: withSWR,
      });

      await waitFor(() => {
        expect(result.current.data).toBe(latestVersion);
      });

      expect(useGlobalStore.getState().hasNewVersion).toBe(true);
      expect(useGlobalStore.getState().latestVersion).toBe(latestVersion);
    });
  });
});
