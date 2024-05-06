import { renderHook } from '@testing-library/react';
import urlJoin from 'url-join';
import { describe, expect, it, vi } from 'vitest';

import { INBOX_SESSION_ID } from '@/const/session';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useGlobalStore } from '@/store/global';
import { ChatSettingsTabs, SettingsTabs, SidebarTabKey } from '@/store/global/initialState';
import { useSessionStore } from '@/store/session';

import { useOpenChatSettings, useOpenSettings } from './useInterceptingRoutes';

// Mocks
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn((href) => href),
    replace: vi.fn((href) => href),
  })),
}));
vi.mock('@/hooks/useQuery', () => ({
  useQuery: vi.fn(() => ({})),
}));
vi.mock('@/hooks/useIsMobile', () => ({
  useIsMobile: vi.fn(),
}));
vi.mock('@/store/session', () => ({
  useSessionStore: vi.fn(),
}));
vi.mock('@/store/global', () => ({
  useGlobalStore: {
    setState: vi.fn(),
  },
}));

describe('useOpenSettings', () => {
  it('should handle mobile route correctly', () => {
    vi.mocked(useIsMobile).mockReturnValue(true);
    const { result } = renderHook(() => useOpenSettings(SettingsTabs.Common));
    expect(result.current()).toBe('/settings/common');
  });

  it('should handle desktop route correctly', () => {
    vi.mocked(useIsMobile).mockReturnValue(false);
    const { result } = renderHook(() => useOpenSettings(SettingsTabs.Agent));
    expect(result.current()).toBe('/settings/modal?tab=agent');
  });
});

describe('useOpenChatSettings', () => {
  it('should handle inbox session id correctly', () => {
    vi.mocked(useSessionStore).mockReturnValue(INBOX_SESSION_ID);
    const { result } = renderHook(() => useOpenChatSettings());

    expect(result.current()).toBe('/settings/modal?session=inbox&tab=agent'); // Assuming openSettings returns a function
  });

  it('should handle mobile route for chat settings', () => {
    vi.mocked(useSessionStore).mockReturnValue('123');
    vi.mocked(useIsMobile).mockReturnValue(true);
    const { result } = renderHook(() => useOpenChatSettings(ChatSettingsTabs.Meta));
    expect(result.current()).toBe('/chat/settings');
  });

  it('should handle desktop route for chat settings with session and tab', () => {
    vi.mocked(useSessionStore).mockReturnValue('456');
    vi.mocked(useIsMobile).mockReturnValue(false);
    const { result } = renderHook(() => useOpenChatSettings(ChatSettingsTabs.Meta));
    expect(result.current()).toBe('/chat/settings/modal?session=456&tab=meta');
  });
});
