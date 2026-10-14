/**
 * @vitest-environment happy-dom
 */
import { act, fireEvent, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import HeteroDeviceSwitcher from '../HeteroDeviceSwitcher';

const state = vi.hoisted(() => ({
  activeTopicId: undefined as string | undefined,
  /** `undefined`: the host publishes no topic; `null`: its conversation has none. */
  composerTopicId: undefined as string | null | undefined,
  confirmModal: vi.fn(),
  selectExecutionTarget: vi.fn(),
  topics: {} as Record<string, { boundDeviceId?: string }>,
  updateTopicMetadata: vi.fn(),
}));

vi.mock('@lobehub/ui', async (importOriginal) => ({
  ...(await importOriginal<object>()),
  // Render the menu inline so its rows are clickable without opening it.
  Popover: ({ children, content }: { children: ReactNode; content: ReactNode }) => (
    <>
      {children}
      {content}
    </>
  ),
}));

vi.mock('@lobehub/ui/base-ui', async (importOriginal) => ({
  ...(await importOriginal<object>()),
  confirmModal: state.confirmModal,
  toast: { error: vi.fn() },
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('@/features/ChatInput/hooks/useChatInputResourceAccess', () => ({
  useChatInputResourceAccess: () => ({ canUseResource: true }),
}));

vi.mock('@/features/ChatInput/hooks/useLocalSandboxCapability', () => ({
  useLocalSandboxCapability: () => ({ data: undefined, mutate: vi.fn() }),
}));

vi.mock('@/features/ChatInput/hooks/useSelectExecutionTarget', () => ({
  useSelectExecutionTarget: () => state.selectExecutionTarget,
}));

vi.mock('@/features/DeviceManager/useDeviceList', () => ({
  useDeviceList: () => ({
    data: [
      {
        channels: [],
        deviceId: 'device-a',
        friendlyName: 'Device A',
        online: true,
        scope: 'personal',
      },
      {
        channels: [],
        deviceId: 'device-b',
        friendlyName: 'Device B',
        online: true,
        scope: 'personal',
      },
    ],
    isLoading: false,
    mutate: vi.fn(),
  }),
}));

vi.mock('@/features/Workspace/useWorkspaceAwareNavigate', () => ({
  useWorkspaceAwareNavigate: () => vi.fn(),
}));

vi.mock('@/helpers/gatewayMode', () => ({ useIsGatewayModeEnabled: () => true }));

vi.mock('@/hooks/useEffectiveAgencyConfig', () => ({
  useEffectiveAgencyConfig: () => ({
    agencyConfig: {
      boundDeviceId: 'device-a',
      executionTarget: 'device',
      heterogeneousProvider: { type: 'claude-code' },
    },
    canDisplayExecutionTarget: true,
    canSelectExecutionTarget: true,
    isPreferenceLoading: false,
    workspaceScoped: false,
  }),
}));

vi.mock('@/hooks/useEffectiveWorkingDirectory', () => ({
  useEffectiveWorkingDirectory: () => '/repo',
}));

vi.mock('../useCommitWorkingDirectory', () => ({
  useCommitWorkingDirectory: () => ({ commit: vi.fn() }),
}));

vi.mock('../../store', () => ({
  useChatInputStore: (selector: (s: object) => unknown) =>
    selector({ topicId: state.composerTopicId }),
}));

vi.mock('@/store/agent', () => ({
  useAgentStore: (selector: (s: object) => unknown) => selector({ agentMap: { 'agent-1': {} } }),
}));

vi.mock('@/store/electron', () => ({
  useElectronStore: (selector: (s: object) => unknown) =>
    selector({ gatewayDeviceInfo: undefined, useFetchGatewayDeviceInfo: () => undefined }),
}));

// Store boundary: the real topic selectors run against this state.
vi.mock('@/store/chat', () => ({
  useChatStore: (selector: (s: object) => unknown) =>
    selector({
      activeTopicId: state.activeTopicId,
      topicDataMap: {},
      topicDetailMap: Object.fromEntries(
        Object.entries(state.topics).map(([id, metadata]) => [
          id,
          { agentId: 'agent-1', id, metadata },
        ]),
      ),
      updateTopicMetadata: state.updateTopicMetadata,
    }),
}));

beforeEach(() => {
  // The main column's topic stays globally active while a side pane renders another.
  state.activeTopicId = 'main-topic';
  state.composerTopicId = undefined;
  state.topics = {
    'main-topic': { boundDeviceId: 'device-a' },
    'pane-topic': { boundDeviceId: 'device-a' },
  };
  state.confirmModal.mockReset();
  state.selectExecutionTarget.mockReset().mockResolvedValue(true);
  state.updateTopicMetadata.mockReset().mockResolvedValue(undefined);
});

describe('HeteroDeviceSwitcher', () => {
  // Moving a topic drops its CLI session and cwd, so it must hit the pane's own topic.
  it("moves the composer's own topic to the picked device, not the global active topic", async () => {
    state.composerTopicId = 'pane-topic';

    render(<HeteroDeviceSwitcher agentId="agent-1" />);
    fireEvent.click(screen.getByText('Device B'));

    expect(state.confirmModal).toHaveBeenCalledTimes(1);
    await act(() => state.confirmModal.mock.calls[0][0].onOk());

    expect(state.updateTopicMetadata).toHaveBeenCalledTimes(1);
    expect(state.updateTopicMetadata).toHaveBeenCalledWith(
      'pane-topic',
      expect.objectContaining({ boundDeviceId: 'device-b', heteroSessionId: undefined }),
    );
  });

  it('switches the agent target without touching any topic when the composer conversation has no topic', async () => {
    state.composerTopicId = null;

    render(<HeteroDeviceSwitcher agentId="agent-1" />);
    await act(async () => {
      fireEvent.click(screen.getByText('Device B'));
    });

    expect(state.confirmModal).not.toHaveBeenCalled();
    expect(state.updateTopicMetadata).not.toHaveBeenCalled();
    expect(state.selectExecutionTarget).toHaveBeenCalledWith('device', 'device-b', {
      localSandbox: undefined,
    });
  });
});
