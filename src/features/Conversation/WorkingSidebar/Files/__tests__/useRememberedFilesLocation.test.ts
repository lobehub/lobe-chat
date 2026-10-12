import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { FilesLocation } from '../useRememberedFilesLocation';

const scope = vi.hoisted(() => ({ current: 'u1:personal' }));

vi.mock('@/libs/swr/useCacheScope', () => ({
  getCacheScope: () => scope.current,
  isScopeTrusted: () => true,
  useCacheScope: () => scope.current,
}));

interface Props {
  contextKey?: string;
  resolved?: FilesLocation;
  settled: boolean;
}

/** A fresh page (new store and replica engine) over the same localStorage. */
const boot = async (initialProps: Props) => {
  vi.resetModules();
  const { useRememberedFilesLocation } = await import('../useRememberedFilesLocation');
  return renderHook(
    ({ contextKey, resolved, settled }: Props) =>
      useRememberedFilesLocation(contextKey, resolved, settled),
    { initialProps },
  );
};

/** One session that settles on `location` for `contextKey`. */
const storedRows = () =>
  Array.from({ length: localStorage.length }, (_, i) => localStorage.key(i)!).filter(
    (key) => key.startsWith('replica:filesLocation:') && !key.includes('__replica'),
  );

const remember = async (contextKey: string, location: FilesLocation) => {
  const view = await boot({ contextKey, resolved: location, settled: true });
  await waitFor(() => expect(storedRows().length).toBeGreaterThan(0));
  view.unmount();
};

beforeEach(() => {
  scope.current = 'u1:personal';
  localStorage.clear();
});

describe('useRememberedFilesLocation', () => {
  it('opens where the conversation last was until the device list settles', async () => {
    await remember('topic:t1', { deviceId: 'device-1', directory: '/repo' });

    // Before the device default is known the live resolution is the home fallback.
    const { rerender, result } = await boot({
      contextKey: 'topic:t1',
      resolved: { directory: '/Users/me' },
      settled: false,
    });
    await waitFor(() =>
      expect(result.current).toEqual({ deviceId: 'device-1', directory: '/repo' }),
    );

    rerender({
      contextKey: 'topic:t1',
      resolved: { deviceId: 'device-1', directory: '/repo/next' },
      settled: true,
    });
    expect(result.current).toEqual({ deviceId: 'device-1', directory: '/repo/next' });

    // The next session opens the new location.
    const next = await boot({
      contextKey: 'topic:t1',
      resolved: { directory: '/Users/me' },
      settled: false,
    });
    await waitFor(() =>
      expect(next.result.current).toEqual({ deviceId: 'device-1', directory: '/repo/next' }),
    );
  });

  it('answers with the saved location on the first render, before the replica hydrates', async () => {
    await remember('topic:t1', { directory: '/repo' });

    const { result } = await boot({
      contextKey: 'topic:t1',
      resolved: { directory: '/Users/me' },
      settled: false,
    });

    expect(result.current).toEqual({ directory: '/repo' });
  });

  it('uses the live resolution when nothing was remembered for this context', async () => {
    await remember('topic:other', { directory: '/elsewhere' });

    const { result } = await boot({
      contextKey: 'topic:t1',
      resolved: { directory: '/repo' },
      settled: false,
    });

    await waitFor(() => expect(result.current).toEqual({ directory: '/repo' }));
  });

  it('keeps each identity’s locations apart', async () => {
    await remember('topic:t1', { directory: '/repo' });

    scope.current = 'u2:personal';
    const { result } = await boot({
      contextKey: 'topic:t1',
      resolved: { directory: '/Users/other' },
      settled: false,
    });

    await waitFor(() => expect(result.current).toEqual({ directory: '/Users/other' }));
  });

  it('does not remember an unsettled resolution', async () => {
    const view = await boot({
      contextKey: 'topic:t1',
      resolved: { directory: '/Users/me' },
      settled: false,
    });
    await waitFor(() => expect(view.result.current).toEqual({ directory: '/Users/me' }));

    expect(storedRows()).toEqual([]);
  });

  it('passes the resolution through when there is no context to remember', async () => {
    const { result } = await boot({ resolved: { directory: '' }, settled: false });

    expect(result.current).toEqual({ directory: '' });
  });
});
