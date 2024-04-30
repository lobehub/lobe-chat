import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { withSWR } from '~test-utils';

import { globalService } from '@/services/global';
import { useUserStore } from '@/store/user';

import { type Guide } from './initialState';

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
      const guide: Guide = { topic: true };

      act(() => {
        result.current.updateGuideState(guide);
      });

      expect(result.current.preference.guide).toEqual(guide);
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

      vi.spyOn(result.current.preferenceStorage, 'getFromLocalStorage').mockResolvedValueOnce(
        {} as any,
      );

      const { result: prefernce } = renderHook(() => result.current.useInitPreference(), {
        wrapper: withSWR,
      });

      await waitFor(() => {
        expect(prefernce.current.data).toEqual({});
        expect(result.current.isPreferenceInit).toBeTruthy();
      });
    });
  });
});
