import { beforeEach, describe, expect, it, vi } from 'vitest';

import { recordGitCommandEffects } from '.';

const chatMocks = vi.hoisted(() => ({
  topics: {} as Record<string, { metadata?: Record<string, any> }>,
  updateTopicMetadata: vi.fn(),
}));

const gitServiceMocks = vi.hoisted(() => ({ listGitWorktrees: vi.fn() }));

vi.mock('@/store/device/gitStatus/store', () => ({
  getGitStatusStoreState: () => ({ revalidateGitStatus: vi.fn() }),
}));

vi.mock('@/store/chat/store', () => ({
  getChatStoreState: () => chatMocks,
}));

vi.mock('@/store/chat/selectors', () => ({
  topicSelectors: {
    getTopicById: (id: string) => (state: typeof chatMocks) => state.topics[id],
  },
}));

vi.mock('@/services/git', () => ({ gitService: gitServiceMocks }));

vi.mock('@/store/electron', () => ({
  getElectronStoreState: () => ({ gatewayDeviceInfo: { deviceId: 'device-1' } }),
}));

const SOURCE = '/home/u/lobehub';
const WORKTREE = '/home/u/lobehub-wt-21058';

const inWorktree = (activeWorktree = WORKTREE) => ({
  metadata: {
    workingDirectoryConfig: {
      git: { activeWorktree, branch: 'fix/x', isWorktree: true },
      path: SOURCE,
      repoType: 'github',
    },
  },
});

/** The source repo with the worktree, its branch, upstream and PR dropped. */
const BACK_IN_SOURCE = {
  workingDirectoryConfig: { git: { isWorktree: false }, path: SOURCE, repoType: 'github' },
};

beforeEach(() => {
  vi.clearAllMocks();
  chatMocks.topics = {};
});

describe('recordGitCommandEffects — git worktree remove', () => {
  it('clears the active worktree the agent removed', async () => {
    chatMocks.topics = { t1: inWorktree() };

    // Verbatim from the reported run: the next turn spawned in this deleted directory.
    await recordGitCommandEffects({
      command: `git worktree remove ${WORKTREE} && git worktree list | grep 21058; echo done`,
      resultContent: 'done',
      topicId: 't1',
    });

    expect(chatMocks.updateTopicMetadata).toHaveBeenCalledWith('t1', BACK_IN_SOURCE);
  });

  it('resolves a relative path, flags and a -C override', async () => {
    chatMocks.topics = { t1: inWorktree() };
    await recordGitCommandEffects({
      command: 'git worktree remove --force ../lobehub-wt-21058/',
      topicId: 't1',
    });
    expect(chatMocks.updateTopicMetadata).toHaveBeenCalledWith('t1', BACK_IN_SOURCE);

    vi.clearAllMocks();
    await recordGitCommandEffects({
      command: 'git -C /home/u worktree remove -f lobehub-wt-21058',
      topicId: 't1',
    });
    expect(chatMocks.updateTopicMetadata).toHaveBeenCalledWith('t1', BACK_IN_SOURCE);
  });

  it('expands a variable and unwraps the Codex shell wrapper', async () => {
    chatMocks.topics = { t1: inWorktree() };
    await recordGitCommandEffects({
      command: `/bin/zsh -lc "WT=${WORKTREE} && git worktree remove \\"$WT\\""`,
      topicId: 't1',
    });
    expect(chatMocks.updateTopicMetadata).toHaveBeenCalledWith('t1', BACK_IN_SOURCE);

    vi.clearAllMocks();
    await recordGitCommandEffects({
      command: ['/bin/bash', '-lc', `git worktree remove ${WORKTREE}`],
      topicId: 't1',
    });
    expect(chatMocks.updateTopicMetadata).toHaveBeenCalledWith('t1', BACK_IN_SOURCE);
  });

  it('nets out a worktree added and removed in one command', async () => {
    chatMocks.topics = {
      t1: { metadata: { workingDirectoryConfig: { path: SOURCE, repoType: 'github' } } },
    };
    await recordGitCommandEffects({
      command: `git worktree add ${WORKTREE} && cd ${WORKTREE} && bun test && git worktree remove ${WORKTREE}`,
      topicId: 't1',
    });
    expect(chatMocks.updateTopicMetadata).toHaveBeenCalledWith('t1', BACK_IN_SOURCE);
  });

  it('keeps the active worktree when a different one is removed', async () => {
    chatMocks.topics = { t1: inWorktree() };
    await recordGitCommandEffects({
      command: 'git worktree remove /home/u/lobehub-other',
      topicId: 't1',
    });
    expect(chatMocks.updateTopicMetadata).not.toHaveBeenCalled();
  });

  it('ignores the words in a non-git command and an unresolvable path', async () => {
    chatMocks.topics = { t1: inWorktree() };
    await recordGitCommandEffects({
      command: `echo git worktree remove ${WORKTREE}`,
      topicId: 't1',
    });
    await recordGitCommandEffects({ command: 'git worktree remove "$UNSET"', topicId: 't1' });
    expect(chatMocks.updateTopicMetadata).not.toHaveBeenCalled();
  });
});
