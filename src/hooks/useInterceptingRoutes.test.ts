import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { INBOX_SESSION_ID } from '@/const/session';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useAgentStore } from '@/store/agent';
import { ChatSettingsTabs, SettingsTabs } from '@/store/global/initialState';
import { useSessionStore } from '@/store/session';

import { useOpenChatSettings } from './useInterceptingRoutes';

const mockNavigate = vi.fn();
const mockUseNavigate = vi.fn(() => mockNavigate);
const mockUseLocation = vi.fn(() => ({ pathname: '/' }));
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockUseNavigate(),
  useLocation: () => mockUseLocation(),
}));
vi.mock('@/hooks/useIsMobile', () => ({
  useIsMobile: vi.fn(),
}));
vi.mock('@/store/session', () => ({
  useSessionStore: vi.fn(),
}));
let isDeprecatedEdition = false;
vi.mock('@/const/version', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/const/version')>();
  return {
    ...actual,
    get isDeprecatedEdition() {
      return isDeprecatedEdition;
    },
  };
});

beforeEach(() => {
  mockNavigate.mockClear();
  mockUseNavigate.mockClear();
  mockUseLocation.mockReset();
  mockUseLocation.mockReturnValue({ pathname: '/' });
  vi.mocked(useSessionStore).mockReset();
  vi.mocked(useIsMobile).mockReset();
  useAgentStore.setState({ showAgentSetting: false });
  isDeprecatedEdition = false;
});

describe('useOpenChatSettings', () => {
  it('navigates to deprecated agent setting when inbox session is active', () => {
    isDeprecatedEdition = true;
    vi.mocked(useSessionStore).mockReturnValue(INBOX_SESSION_ID);
    const { result } = renderHook(() => useOpenChatSettings());

    act(() => {
      result.current();
    });

    expect(mockNavigate).toHaveBeenCalledWith(`/chat/settings?active=${SettingsTabs.Agent}`);
  });

  it('navigates to mobile chat settings with session info', () => {
    vi.mocked(useSessionStore).mockReturnValue('123');
    vi.mocked(useIsMobile).mockReturnValue(true);
    const { result } = renderHook(() => useOpenChatSettings(ChatSettingsTabs.Meta));

    act(() => {
      result.current();
    });

    expect(mockNavigate).toHaveBeenCalledWith(
      `/chat/settings?session=123&showMobileWorkspace=true`,
    );
  });

  it('opens desktop agent settings overlay when not on mobile', () => {
    vi.mocked(useSessionStore).mockReturnValue('456');
    vi.mocked(useIsMobile).mockReturnValue(false);

    const { result } = renderHook(() => useOpenChatSettings(ChatSettingsTabs.Meta));

    act(() => {
      result.current();
    });

    expect(useAgentStore.getState().showAgentSetting).toBeTruthy();
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
