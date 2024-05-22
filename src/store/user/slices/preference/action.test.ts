import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { withSWR } from '~test-utils';

import { DEFAULT_PREFERENCE } from '@/const/user';
import { userService } from '@/services/user';
import { useUserStore } from '@/store/user';
import { UserGuide, UserPreference } from '@/types/user';

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('createPreferenceSlice', () => {
  describe('updateGuideState', () => {
    it('should update guide state', () => {
      const { result } = renderHook(() => useUserStore());
      const guide: UserGuide = { topic: true };

      act(() => {
        result.current.updateGuideState(guide);
      });

      expect(result.current.preference.guide!.topic).toBeTruthy();
    });
  });

  describe('updatePreference', () => {
    it('should update preference', () => {
      const { result } = renderHook(() => useUserStore());

      act(() => {
        result.current.updatePreference({ hideSyncAlert: true });
      });

      expect(result.current.preference.hideSyncAlert).toEqual(true);
    });
  });

  describe('useInitPreference', () => {
    it('should return false when userId is empty', async () => {
      const { result } = renderHook(() => useUserStore());

      vi.spyOn(userService, 'getPreference').mockResolvedValueOnce({} as any);

      const { result: prefernce } = renderHook(() => result.current.useInitPreference(), {
        wrapper: withSWR,
      });

      await waitFor(() => {
        expect(prefernce.current.data).toEqual({});
        expect(result.current.isPreferenceInit).toBeTruthy();
      });
    });
    it('should return default preference when local storage is empty', async () => {
      const { result } = renderHook(() => useUserStore());

      vi.spyOn(userService, 'getPreference').mockResolvedValueOnce({} as any);

      renderHook(() => result.current.useInitPreference(), {
        wrapper: withSWR,
      });

      await waitFor(() => {
        expect(result.current.preference).toEqual(DEFAULT_PREFERENCE);
        expect(result.current.isPreferenceInit).toBeTruthy();
      });
    });

    it('should return saved preference when local storage has data', async () => {
      const { result } = renderHook(() => useUserStore());
      const savedPreference: UserPreference = {
        ...DEFAULT_PREFERENCE,
        hideSyncAlert: true,
        guide: { topic: false, moveSettingsToAvatar: true },
      };

      vi.spyOn(userService, 'getPreference').mockResolvedValueOnce(savedPreference);

      const { result: prefernce } = renderHook(() => result.current.useInitPreference(), {
        wrapper: withSWR,
      });

      await waitFor(() => {
        expect(prefernce.current.data).toEqual(savedPreference);
        expect(result.current.isPreferenceInit).toBeTruthy();
        expect(result.current.preference).toEqual(savedPreference);
      });
    });
  });
});
