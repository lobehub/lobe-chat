import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ChatSettingsTabs } from '@/store/global/initialState';

import Content from './Content';

const mocks = vi.hoisted(() => ({
  agentState: {
    activeAgentId: 'inbox-agent',
    config: {},
    isCurrentAgentHeterogeneous: false,
    isInbox: true,
    meta: {},
    optimisticUpdateAgentConfig: vi.fn(),
    optimisticUpdateAgentMeta: vi.fn(),
  },
  userState: { preference: { lab: { enableAgentGraphConfig: false, enableSelfLearning: true } } },
}));

vi.mock('@/features/AgentSetting', () => ({
  AgentSettings: ({ tab }: { tab: ChatSettingsTabs }) => (
    <div data-tab={tab} data-testid="agent-settings-content" />
  ),
  SettingsModalLayout: ({
    activeTab,
    tabs = [],
    children,
  }: {
    activeTab?: string;
    children?: ReactNode;
    tabs?: { key: string }[];
  }) => (
    <div
      data-active={activeTab}
      data-tabs={tabs.map((tab) => tab.key).join(',')}
      data-testid="layout"
    >
      {children}
    </div>
  ),
}));

vi.mock('@/store/agent', () => {
  const useAgentStore = (selector: (state: typeof mocks.agentState) => unknown) =>
    selector(mocks.agentState);
  useAgentStore.getState = () => mocks.agentState;

  return { useAgentStore };
});

vi.mock('@/store/agent/selectors', () => ({
  agentSelectors: {
    currentAgentConfig: (state: typeof mocks.agentState) => state.config,
    currentAgentMeta: (state: typeof mocks.agentState) => state.meta,
    isCurrentAgentHeterogeneous: (state: typeof mocks.agentState) =>
      state.isCurrentAgentHeterogeneous,
  },
  builtinAgentSelectors: {
    isInboxAgent: (state: typeof mocks.agentState) => state.isInbox,
  },
}));

vi.mock('@/store/user', () => ({
  useUserStore: (selector: (state: typeof mocks.userState) => unknown) => selector(mocks.userState),
}));

vi.mock('@/store/user/selectors', () => ({
  labPreferSelectors: {
    enableAgentGraphConfig: (state: typeof mocks.userState) =>
      state.preference.lab.enableAgentGraphConfig,
  },
}));

// A stale rollout flag must not bring the per-agent tab back.
vi.mock('@/store/serverConfig', () => {
  const state = { featureFlags: { enableAgentSelfIteration: true } };
  return {
    featureFlagsSelectors: (s: typeof state) => s.featureFlags,
    useServerConfigStore: (selector: (s: typeof state) => unknown) => selector(state),
  };
});

/**
 * There is no per-agent Self-Iteration tab any more: Labs → Self-evolving is the only control.
 */
describe('AgentSettings Content', () => {
  beforeEach(() => {
    mocks.agentState.isInbox = true;
    mocks.userState.preference.lab.enableSelfLearning = true;
  });

  it('shows no Self-Iteration tab for inbox even with Self-evolving on', () => {
    render(<Content />);

    const layout = screen.getByTestId('layout');
    expect(layout).toHaveAttribute('data-active', ChatSettingsTabs.Opening);
    expect(layout).toHaveAttribute('data-tabs', ChatSettingsTabs.Opening);
    expect(screen.getByTestId('agent-settings-content')).toHaveAttribute(
      'data-tab',
      ChatSettingsTabs.Opening,
    );
  });

  it('shows no Self-Iteration tab for custom agents even with Self-evolving on', () => {
    mocks.agentState.isInbox = false;

    render(<Content />);

    expect(screen.getByTestId('layout')).toHaveAttribute('data-tabs', ChatSettingsTabs.Opening);
  });
});
