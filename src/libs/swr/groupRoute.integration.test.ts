import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { createElement, Suspense } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { SWRConfig } from 'swr';
import { afterEach, describe, expect, it, vi } from 'vitest';

import GroupLayout from '@/routes/(main)/group/_layout';

import { groupKeys } from './keys';
import { useClientDataSWRWithSync } from './useClientDataSWRWithSync';

vi.mock('@/business/client/hooks/useActiveWorkspaceId', () => ({
  useActiveWorkspaceId: () => null,
}));
vi.mock('@/const/version', () => ({ isDesktop: false }));
vi.mock('@/components/AsyncError', () => ({ default: () => null }));
vi.mock('@/features/GroupNotFound', () => ({
  GroupNotFoundGuard: ({ children }: PropsWithChildren) => children,
}));
vi.mock('@/features/ProtocolUrlHandler', () => ({ default: () => null }));
vi.mock('@/hooks/useInitGroupConfig', () => ({ useInitGroupConfig: () => undefined }));
vi.mock('@/routes/(main)/group/_layout/GroupIdSync', () => ({ default: () => null }));
vi.mock('@/routes/(main)/group/_layout/RegisterHotkeys', () => ({ default: () => null }));
vi.mock('@/routes/(main)/group/_layout/Sidebar', () => ({ default: () => null }));

afterEach(cleanup);

describe.each(['/group/group-1', '/group/group-1/profile'])('client data under %s', (path) => {
  const wrapper = ({ children }: PropsWithChildren) =>
    createElement(
      SWRConfig,
      { value: { provider: () => new Map(), shouldRetryOnError: false } },
      createElement(
        MemoryRouter,
        { initialEntries: [path] },
        createElement(
          Suspense,
          { fallback: null },
          createElement(
            Routes,
            null,
            createElement(
              Route,
              { element: createElement(GroupLayout), path: '/group/:gid' },
              createElement(Route, { element: children, index: true }),
              createElement(Route, { element: children, path: 'profile' }),
            ),
          ),
        ),
      ),
    );

  it('commits while a cold request is pending and syncs the resolved data', async () => {
    const group = { id: 'group-1' };
    const onData = vi.fn<(data: typeof group) => void>();
    let resolve!: (data: typeof group) => void;
    const pending = new Promise<typeof group>((resolvePromise) => {
      resolve = resolvePromise;
    });

    const { result } = renderHook(
      () => useClientDataSWRWithSync(groupKeys.detail(group.id), () => pending, { onData }),
      { wrapper },
    );

    try {
      expect(result.current?.isLoading).toBe(true);
      expect(onData).not.toHaveBeenCalled();
    } finally {
      await act(async () => {
        resolve(group);
        await pending;
      });
    }

    await waitFor(() => expect(result.current.data).toEqual(group));
    await waitFor(() => expect(onData).toHaveBeenCalledWith(group));
  });

  it('returns a request error and recovers after retrying', async () => {
    const group = { id: 'group-1' };
    const error = new Error('Group request failed');
    const fetcher = vi
      .fn<() => Promise<typeof group>>()
      .mockRejectedValueOnce(error)
      .mockResolvedValue(group);

    const { result } = renderHook(
      () => useClientDataSWRWithSync(groupKeys.detail(group.id), fetcher),
      { wrapper },
    );

    await waitFor(() => expect(result.current?.error).toBe(error));

    await act(async () => {
      await result.current.mutate();
    });

    await waitFor(() => {
      expect(result.current.data).toEqual(group);
      expect(result.current.error).toBeUndefined();
    });
  });
});
