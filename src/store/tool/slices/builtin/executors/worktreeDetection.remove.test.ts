import { beforeEach, describe, expect, it, vi } from 'vitest';

import { recordGitCommandEffects } from './worktreeDetection';

const chatMocks = vi.hoisted(() => ({
  topics: {} as Record<string, { metadata?: Record<string, any> }>,
  updateTopicMetadata: vi.fn(),
}));

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

vi.mock('@/services/git', () => ({
  gitService: { listGitWorktrees: vi.fn() },
}));

vi.mock('@/store/electron', () => ({
  getElectronStoreState: () => ({ gatewayDeviceInfo: { deviceId: 'device-1' } }),
}));

const setTopicWorktree = (activeWorktree: string) => {
  chatMocks.topics = {
    t1: {
      metadata: {
        workingDirectoryConfig: {
          git: { activeWorktree, branch: 'fix/tab-nav', isWorktree: true },
          path: '/repo',
        },
      },
    },
  };
};

// Regression: a run that added a scratch worktree, pushed from it and then
// removed it kept the topic's `activeWorktree`, so every later run in that
// conversation failed with "working directory does not exist".
describe('recordGitCommandEffects — git worktree remove', () => {
  beforeEach(() => {
    chatMocks.updateTopicMetadata.mockReset();
  });

  it('returns the topic to its source repo when the active worktree is removed', async () => {
    setTopicWorktree('/tmp/repo-push');

    await recordGitCommandEffects({
      command:
        'git worktree remove /tmp/repo-push && git branch -D fix/tab-nav -q; git status --short',
      topicId: 't1',
    });

    expect(chatMocks.updateTopicMetadata).toHaveBeenCalledWith('t1', {
      workingDirectoryConfig: { git: { isWorktree: false }, path: '/repo' },
    });
  });

  it('resolves a relative path and skips flags', async () => {
    setTopicWorktree('/repo/.worktrees/wt');

    await recordGitCommandEffects({
      command: 'git worktree remove --force .worktrees/wt',
      topicId: 't1',
    });

    expect(chatMocks.updateTopicMetadata).toHaveBeenCalledWith('t1', {
      workingDirectoryConfig: { git: { isWorktree: false }, path: '/repo' },
    });
  });

  it('handles the shell-wrapped argv form', async () => {
    setTopicWorktree('/tmp/wt');

    await recordGitCommandEffects({
      command: ['/bin/zsh', '-lc', 'git worktree remove /tmp/wt'],
      topicId: 't1',
    });

    expect(chatMocks.updateTopicMetadata).toHaveBeenCalledTimes(1);
  });

  it('keeps the active worktree when another worktree is removed', async () => {
    setTopicWorktree('/tmp/wt');

    await recordGitCommandEffects({ command: 'git worktree remove /tmp/other', topicId: 't1' });

    expect(chatMocks.updateTopicMetadata).not.toHaveBeenCalled();
  });

  it('ignores a command that only mentions worktree remove', async () => {
    setTopicWorktree('/tmp/wt');

    await recordGitCommandEffects({ command: 'echo git worktree remove /tmp/wt', topicId: 't1' });

    expect(chatMocks.updateTopicMetadata).not.toHaveBeenCalled();
  });

  it('keeps a worktree that the same command removes and then recreates', async () => {
    setTopicWorktree('/tmp/wt');

    await recordGitCommandEffects({
      command: 'git worktree remove /tmp/wt && git worktree add /tmp/wt -b fresh',
      topicId: 't1',
    });

    expect(chatMocks.updateTopicMetadata).toHaveBeenCalledWith('t1', {
      workingDirectoryConfig: {
        git: { activeWorktree: '/tmp/wt', branch: 'fresh', isWorktree: true },
        path: '/repo',
      },
    });
  });

  it('ends on the source repo when one command adds and removes the same worktree', async () => {
    chatMocks.topics = { t1: { metadata: { workingDirectoryConfig: { path: '/repo' } } } };

    await recordGitCommandEffects({
      command: 'git worktree add /tmp/wt -b tmp && git worktree remove /tmp/wt',
      topicId: 't1',
    });

    expect(chatMocks.updateTopicMetadata).toHaveBeenCalledWith('t1', {
      workingDirectoryConfig: { git: { isWorktree: false }, path: '/repo' },
    });
  });
});
