import { act, renderHook } from '@testing-library/react';
import { router } from 'next/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { globalService } from '@/services/global';
import { useGlobalStore } from '@/store/global';

import { SidebarTabKey } from './initialState';

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
});
