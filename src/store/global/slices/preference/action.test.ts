import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useGlobalStore } from '@/store/global';

import { type Guide } from './initialState';

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
