/**
 * @vitest-environment happy-dom
 */
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useAddFolderAction } from './useAddFolderAction';

const agentMock = vi.hoisted(() => ({
  activeAgentId: 'agent-1' as string | undefined,
  heterogeneous: true,
}));
const electronMock = vi.hoisted(() => ({ deviceId: 'device-1' as string | undefined }));
const deviceMock = vi.hoisted(() => ({ defaultCwd: '/device-default' as string | undefined }));
const agencyMock = vi.hoisted(() => ({
  agencyConfig: { boundDeviceId: 'device-2' } as Record<string, unknown> | undefined,
  isPreferenceLoading: false,
  workspaceScoped: false,
}));
const commitMock = vi.hoisted(() => vi.fn());
const openPickWorkingDirModalMock = vi.hoisted(() => vi.fn());
const routerPushMock = vi.hoisted(() => vi.fn());
const selectFolderMock = vi.hoisted(() => vi.fn());
const chatStoreMock = vi.hoisted(() => ({
  setPendingNewTopicDirectory: vi.fn(),
  switchTopic: vi.fn(),
}));
const toastMock = vi.hoisted(() => ({ error: vi.fn() }));

// The remote-device branch is the one under test: the topic sits on `device-2`
// while this machine is `device-1`, so no native folder dialog is involved.
vi.mock('@lobechat/const', () => ({
  AGENT_CHAT_URL: (agentId: string) => `/agent/${agentId}`,
  isDesktop: true,
}));

vi.mock('@lobehub/ui/base-ui', async (importOriginal) => ({
  ...(await importOriginal<object>()),
  toast: toastMock,
}));

vi.mock('@/business/client/hooks/useActiveWorkspaceSlug', () => ({
  useActiveWorkspaceSlug: () => 'lobehub',
}));

vi.mock('@/features/ChatInput/ControlBar/useCommitWorkingDirectory', () => ({
  useCommitWorkingDirectory: () => ({
    commit: commitMock,
    isPreferenceLoading: agencyMock.isPreferenceLoading,
  }),
}));

vi.mock('@/features/WorkingDirectory', () => ({
  openPickWorkingDirModal: openPickWorkingDirModalMock,
}));

vi.mock('@/helpers/agentWorkingDirectory', () => ({
  resolveTargetDeviceId: (config?: { boundDeviceId?: string }) => config?.boundDeviceId,
}));

vi.mock('@/hooks/useActiveLocation', () => ({
  useActiveLocation: () => ({ hash: '', pathname: '/lobehub/agent/agent-1/chat', search: '' }),
}));

vi.mock('@/hooks/useEffectiveAgencyConfig', () => ({
  useEffectiveAgencyConfig: () => ({
    agencyConfig: agencyMock.agencyConfig,
    isPreferenceLoading: agencyMock.isPreferenceLoading,
    workspaceScoped: agencyMock.workspaceScoped,
  }),
}));

vi.mock('@/hooks/useQueryRoute', () => ({
  useQueryRoute: () => ({ push: routerPushMock }),
}));

vi.mock('@/services/electron/system', () => ({
  electronSystemService: { selectFolder: selectFolderMock },
}));

vi.mock('@/store/agent', () => ({
  useAgentStore: (selector: (state: object) => unknown) =>
    selector({ activeAgentId: agentMock.activeAgentId, heterogeneous: agentMock.heterogeneous }),
}));

vi.mock('@/store/agent/selectors', () => ({
  agentSelectors: {
    currentAgentHeterogeneousProviderType: (state: { heterogeneous?: boolean }) =>
      state?.heterogeneous ? 'claude-code' : undefined,
  },
}));

vi.mock('@/store/chat', () => ({
  useChatStore: { getState: () => chatStoreMock },
}));

vi.mock('@/store/device', () => ({
  deviceSelectors: { getDeviceDefaultCwd: () => () => deviceMock.defaultCwd },
  useDeviceStore: (selector: (state: object) => unknown) => selector({}),
}));

vi.mock('@/store/electron', () => ({
  useElectronStore: (selector: (state: object) => unknown) =>
    selector({
      gatewayDeviceInfo: electronMock.deviceId ? { deviceId: electronMock.deviceId } : undefined,
    }),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

describe('useAddFolderAction', () => {
  beforeEach(() => {
    agentMock.activeAgentId = 'agent-1';
    agentMock.heterogeneous = true;
    electronMock.deviceId = 'device-1';
    deviceMock.defaultCwd = '/device-default';
    agencyMock.agencyConfig = { boundDeviceId: 'device-2' };
    agencyMock.isPreferenceLoading = false;
    commitMock.mockReset();
    openPickWorkingDirModalMock.mockReset();
    routerPushMock.mockReset();
    selectFolderMock.mockReset();
    chatStoreMock.setPendingNewTopicDirectory.mockReset();
    chatStoreMock.switchTopic.mockReset();
    toastMock.error.mockReset();
  });

  it('is unavailable for built-in agents, which never work inside a folder', () => {
    agentMock.heterogeneous = false;

    const { result } = renderHook(() => useAddFolderAction());

    expect(result.current.canAddFolder).toBe(false);
  });

  it('is unavailable while the agent has no resolvable target device', () => {
    agencyMock.agencyConfig = undefined;

    const { result } = renderHook(() => useAddFolderAction());

    expect(result.current.canAddFolder).toBe(false);
  });

  it('is unavailable without an active agent', () => {
    agentMock.activeAgentId = undefined;

    const { result } = renderHook(() => useAddFolderAction());

    expect(result.current.canAddFolder).toBe(false);
  });

  it('stays disabled until the working-directory preference settles', () => {
    agencyMock.isPreferenceLoading = true;

    const { result } = renderHook(() => useAddFolderAction());

    expect(result.current.canAddFolder).toBe(true);
    expect(result.current.disabled).toBe(true);
  });

  it('opens the picker on the agent device, then commits the picked folder and starts the topic', async () => {
    const { result } = renderHook(() => useAddFolderAction());

    expect(result.current).toMatchObject({
      canAddFolder: true,
      disabled: false,
      label: 'workingDirectory.addFolder',
    });

    act(() => result.current.run());

    expect(openPickWorkingDirModalMock).toHaveBeenCalledWith(
      expect.objectContaining({ defaultPath: '/device-default', deviceId: 'device-2' }),
    );
    expect(selectFolderMock).not.toHaveBeenCalled();

    const picked = { path: '/repo/a', repoType: 'github' as const };
    await act(async () => {
      await openPickWorkingDirModalMock.mock.calls[0][0].onPick(picked);
    });

    expect(commitMock).toHaveBeenCalledWith(picked, { rethrow: true, showErrorMessage: false });
    expect(chatStoreMock.setPendingNewTopicDirectory).toHaveBeenCalledOnce();
    expect(chatStoreMock.switchTopic).toHaveBeenCalledWith(null, { skipRefreshMessage: true });
    expect(routerPushMock).toHaveBeenCalledOnce();
  });
});
