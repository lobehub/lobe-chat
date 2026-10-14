/**
 * @vitest-environment happy-dom
 */
import { fireEvent, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getPendingTopicRepos, setPendingTopicRepos } from '@/store/chat/pendingTopicRepos';

import CloudRepoSwitcher from '../CloudRepoSwitcher';

const REPO = 'https://github.com/lobehub/lobehub';

const state = vi.hoisted(() => ({
  activeTopicId: undefined as string | undefined,
  /** `undefined`: the host publishes no topic; `null`: its conversation has none. */
  composerTopicId: undefined as string | null | undefined,
  topics: {} as Record<string, { repos?: string[]; workingDirectory?: string }>,
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

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('@/hooks/usePermission', () => ({
  usePermission: () => ({ allowed: true }),
}));

vi.mock('../../store', () => ({
  useChatInputStore: (selector: (s: object) => unknown) =>
    selector({ topicId: state.composerTopicId }),
}));

vi.mock('@/store/agent', () => ({
  useAgentStore: (selector: (s: object) => unknown) =>
    selector({
      agentMap: {
        'agent-1': {
          agencyConfig: {
            heterogeneousProvider: { env: { GITHUB_REPOS: JSON.stringify([REPO]) } },
          },
        },
      },
    }),
}));

// Store boundary: the real topic selectors run against this state.
vi.mock('@/store/chat', () => ({
  useChatStore: (selector: (s: object) => unknown) =>
    selector({
      activeTopicId: state.activeTopicId,
      topicDataMap: {},
      topicDetailMap: Object.fromEntries(
        Object.entries(state.topics).map(([id, metadata]) => [id, { id, metadata }]),
      ),
      updateTopicMetadata: state.updateTopicMetadata,
    }),
}));

beforeEach(() => {
  // The main column's topic stays globally active while a side pane renders another.
  state.activeTopicId = 'main-topic';
  state.composerTopicId = undefined;
  state.topics = {
    'main-topic': { repos: [REPO], workingDirectory: REPO },
    'pane-topic': {},
  };
  state.updateTopicMetadata.mockReset();
  setPendingTopicRepos('agent-1', []);
});

describe('CloudRepoSwitcher', () => {
  it("toggles repos on the composer's own topic rather than the global active topic", () => {
    state.composerTopicId = 'pane-topic';

    render(<CloudRepoSwitcher agentId="agent-1" />);
    fireEvent.click(screen.getByText(REPO));

    expect(state.updateTopicMetadata).toHaveBeenCalledWith('pane-topic', {
      repos: [REPO],
      workingDirectory: REPO,
      workingDirectoryConfig: { path: REPO, repoType: 'github' },
    });
  });

  it('buffers the selection when the composer conversation has no topic, even with an active topic', () => {
    state.composerTopicId = null;

    render(<CloudRepoSwitcher agentId="agent-1" />);
    fireEvent.click(screen.getByText(REPO));

    expect(state.updateTopicMetadata).not.toHaveBeenCalled();
    expect(getPendingTopicRepos('agent-1')).toEqual([REPO]);
  });
});
