import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

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
});
