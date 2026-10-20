import { beforeEach, describe, expect, it, vi } from 'vitest';

import { gitService } from './git';

const listGitBranches = vi.hoisted(() => vi.fn());
const listGitRemoteBranches = vi.hoisted(() => vi.fn());

vi.mock('@/libs/trpc/client', () => ({
  lambdaClient: {
    device: {
      listGitBranches: { query: listGitBranches },
      listGitRemoteBranches: { query: listGitRemoteBranches },
    },
  },
}));

vi.mock('./electron/git', () => ({ electronGitService: {} }));

const REMOTE = { deviceId: 'device-1', path: '/repo' };

describe('gitService branch lists over the device RPC', () => {
  beforeEach(() => vi.clearAllMocks());

  // Review P2: the router used to answer `[]` when the device could not answer,
  // which a replica then persisted over the cached list.
  it('maps a device that could not answer to undefined, not to an empty list', async () => {
    listGitBranches.mockResolvedValue(null);
    listGitRemoteBranches.mockResolvedValue(null);

    expect(await gitService.listGitBranches(REMOTE)).toBeUndefined();
    expect(await gitService.listGitRemoteBranches(REMOTE)).toBeUndefined();
  });

  it('keeps an empty list as a real answer (unborn repo, no origin)', async () => {
    listGitBranches.mockResolvedValue([]);
    listGitRemoteBranches.mockResolvedValue([]);

    expect(await gitService.listGitBranches(REMOTE)).toEqual([]);
    expect(await gitService.listGitRemoteBranches(REMOTE)).toEqual([]);
  });
});
