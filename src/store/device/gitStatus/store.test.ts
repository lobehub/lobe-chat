/**
 * @vitest-environment happy-dom
 *
 * The Overview / chat-input git reads are replicas: after a reload the last
 * branch, ahead/behind counts, dirty counts and worktrees paint from the
 * persisted copy on the first frame, and the device read only confirms them.
 */
import { randomUUID } from 'node:crypto';

import { act, renderHook, waitFor } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { createElement, useEffect } from 'react';
import { SWRConfig, useSWRConfig } from 'swr';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { cacheScope } from '@/libs/replica';
import { CACHE_TIERS } from '@/libs/swr/localStorageProvider';
import { setScopedMutate } from '@/libs/swr/mutate';
import { gitService } from '@/services/git';

import {
  useFetchGitAheadBehind,
  useFetchGitBranch,
  useFetchGitWorkingTreeStatus,
  useFetchGitWorktrees,
} from '../gitHooks';
import {
  gitAheadBehindResource,
  gitBranchResource,
  gitStatusKey,
  gitWorkingTreeStatusResource,
  gitWorktreesResource,
} from './projection';
import { initialGitStatusState, useGitStatusStore } from './store';

vi.mock('@lobechat/const', async (importOriginal) => ({
  ...(await importOriginal()),
  isDesktop: true,
}));

vi.mock('@/services/git', () => ({
  gitService: {
    getGitAheadBehind: vi.fn(),
    getGitBranch: vi.fn(),
    getGitWorkingTreeStatus: vi.fn(),
    listGitWorktrees: vi.fn(),
  },
}));

const MutateBridge = () => {
  const { mutate } = useSWRConfig();
  useEffect(() => setScopedMutate(mutate), [mutate]);
  return null;
};

const wrapper = ({ children }: PropsWithChildren) =>
  createElement(
    SWRConfig,
    { value: { dedupingInterval: 0, provider: () => new Map() } },
    createElement(MutateBridge),
    children,
  );

/** Never-resolving read: the first frame can only come from storage. */
const pending = () => new Promise<never>(() => {});

const RESOURCES = [
  gitBranchResource,
  gitAheadBehindResource,
  gitWorkingTreeStatusResource,
  gitWorktreesResource,
] as const;

const REMOTE = { deviceId: 'device-1', path: '/repo' };
const LOCAL = { deviceId: undefined, path: '/repo' };

describe('git status replicas', () => {
  const scopes = new Set<string>();
  let scope = '';
  const useScope = (next: string) => {
    scope = next;
    scopes.add(next);
    vi.spyOn(cacheScope, 'get').mockImplementation(() => scope);
    vi.spyOn(cacheScope, 'use').mockImplementation(() => scope);
    vi.spyOn(cacheScope, 'canPersist').mockReturnValue(true);
  };
  const seed = (resource: (typeof RESOURCES)[number], params: typeof REMOTE, data: unknown) =>
    resource.storage!.set(
      { queryKey: resource.storageKey(params), scope },
      { data: { value: data } as any, updatedAt: 1 },
    );

  beforeEach(() => {
    useScope(`git-user-${randomUUID()}:personal`);
    act(() => useGitStatusStore.setState(initialGitStatusState));
  });

  afterEach(async () => {
    await Promise.all(
      [...scopes].flatMap((value) =>
        RESOURCES.flatMap((resource) =>
          [REMOTE, LOCAL].map((params) =>
            resource.storage!.remove({ queryKey: resource.storageKey(params), scope: value }),
          ),
        ),
      ),
    );
    scopes.clear();
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  // Regression: these reads lived only in SWR's memory cache, so after a reload
  // the Overview showed a skeleton and the chat-input branch chip popped in.
  it('paints every persisted git read before the device answers', async () => {
    await Promise.all([
      seed(gitBranchResource, REMOTE, { branch: 'feat/cached', detached: false }),
      seed(gitAheadBehindResource, REMOTE, { ahead: 2, behind: 0 }),
      seed(gitWorkingTreeStatusResource, REMOTE, { added: 0, deleted: 0, modified: 2 }),
      seed(gitWorktreesResource, REMOTE, [{ branch: 'feat/wt', path: '/repo-wt' }]),
    ]);
    vi.mocked(gitService.getGitBranch).mockImplementation(pending);
    vi.mocked(gitService.getGitAheadBehind).mockImplementation(pending);
    vi.mocked(gitService.getGitWorkingTreeStatus).mockImplementation(pending);
    vi.mocked(gitService.listGitWorktrees).mockImplementation(pending);

    const { result } = renderHook(
      () => ({
        aheadBehind: useFetchGitAheadBehind('device-1', '/repo'),
        branch: useFetchGitBranch('device-1', '/repo'),
        status: useFetchGitWorkingTreeStatus('device-1', '/repo'),
        worktrees: useFetchGitWorktrees('device-1', '/repo'),
      }),
      { wrapper },
    );

    await waitFor(() => expect(result.current.branch.data?.branch).toBe('feat/cached'));
    expect(result.current.aheadBehind.data).toMatchObject({ ahead: 2 });
    expect(result.current.status.data).toMatchObject({ modified: 2 });
    expect(result.current.worktrees.data).toEqual([{ branch: 'feat/wt', path: '/repo-wt' }]);
    // A persisted row is something to paint: no skeleton while the read is pending.
    expect(result.current.branch.isLoading).toBe(false);
    expect(result.current.branch.isValidating).toBe(true);
    expect(gitService.getGitBranch).toHaveBeenCalledWith(REMOTE);
  });

  it('replaces the persisted row with the device read and persists the new value', async () => {
    await seed(gitBranchResource, LOCAL, { branch: 'old' });
    vi.mocked(gitService.getGitBranch).mockResolvedValue({ branch: 'new', detached: false });

    const { result } = renderHook(() => useFetchGitBranch(undefined, '/repo'), { wrapper });

    await waitFor(() => expect(result.current.data?.branch).toBe('new'));
    await waitFor(async () =>
      expect(
        (
          await gitBranchResource.storage!.get({
            queryKey: gitBranchResource.storageKey(LOCAL),
            scope,
          })
        )?.data,
      ).toEqual({ value: { branch: 'new', detached: false } }),
    );
  });

  it('keys rows by device and path, so another device never paints this one', async () => {
    await seed(gitBranchResource, REMOTE, { branch: 'remote-branch' });
    vi.mocked(gitService.getGitBranch).mockImplementation(pending);

    const { result } = renderHook(() => useFetchGitBranch(undefined, '/repo'), { wrapper });
    // Let the (empty) local hydrate settle.
    await waitFor(() => expect(gitService.getGitBranch).toHaveBeenCalledWith(LOCAL));

    expect(result.current.data).toBeUndefined();
    expect(result.current.isLoading).toBe(true);
    expect(gitStatusKey(REMOTE)).not.toBe(gitStatusKey(LOCAL));
  });

  it('does not paint another identity’s rows', async () => {
    await seed(gitBranchResource, REMOTE, { branch: 'theirs' });
    useScope(`git-user-${randomUUID()}:personal`);
    vi.mocked(gitService.getGitBranch).mockImplementation(pending);

    const { result } = renderHook(() => useFetchGitBranch('device-1', '/repo'), { wrapper });
    await waitFor(() => expect(gitService.getGitBranch).toHaveBeenCalled());

    expect(result.current.data).toBeUndefined();
  });

  it('lets an empty answer replace a stale persisted row', async () => {
    await seed(gitAheadBehindResource, REMOTE, { ahead: 5, behind: 1 });
    vi.mocked(gitService.getGitAheadBehind).mockResolvedValue(undefined);

    const { result } = renderHook(() => useFetchGitAheadBehind('device-1', '/repo'), {
      wrapper,
    });

    await waitFor(() =>
      expect(useGitStatusStore.getState().gitAheadBehindMap[gitStatusKey(REMOTE)]).toEqual({}),
    );
    expect(result.current.data).toBeUndefined();
    expect(result.current.isLoading).toBe(false);
  });

  it('writes an optimistic branch through mutate without refetching', async () => {
    vi.mocked(gitService.getGitBranch).mockResolvedValue({ branch: 'main' });
    const { result } = renderHook(() => useFetchGitBranch('device-1', '/repo'), { wrapper });
    await waitFor(() => expect(result.current.data?.branch).toBe('main'));
    vi.mocked(gitService.getGitBranch).mockClear();

    await act(() =>
      result.current.mutate({ branch: 'feat/x', detached: false }, { revalidate: false }),
    );

    expect(result.current.data?.branch).toBe('feat/x');
    expect(gitService.getGitBranch).not.toHaveBeenCalled();
  });

  it('revalidates the mounted reads of a directory', async () => {
    vi.mocked(gitService.getGitAheadBehind).mockResolvedValue({ ahead: 0, behind: 0 } as any);
    const { result } = renderHook(() => useFetchGitAheadBehind('device-1', '/repo'), {
      wrapper,
    });
    await waitFor(() => expect(result.current.data).toMatchObject({ ahead: 0 }));

    vi.mocked(gitService.getGitAheadBehind).mockResolvedValue({ ahead: 3, behind: 0 } as any);
    await act(() =>
      useGitStatusStore.getState().revalidateGitStatus('device-1', '/repo', ['aheadBehind']),
    );

    await waitFor(() => expect(result.current.data).toMatchObject({ ahead: 3 }));
  });

  // The persistence moved to replicas: the SWR cache tiers must not also keep it.
  it('is not persisted by the SWR cache layer', () => {
    const patterns = [...CACHE_TIERS.idb, ...CACHE_TIERS.local];
    for (const name of ['gitBranch', 'gitAheadBehind', 'gitWorkingTreeStatus', 'gitWorktrees']) {
      expect(patterns.some((pattern) => pattern.includes(name))).toBe(false);
    }
  });
});
