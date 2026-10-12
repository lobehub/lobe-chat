/**
 * @vitest-environment happy-dom
 */
import { renderHook, waitFor } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { createElement } from 'react';
import { type Cache, SWRConfig } from 'swr';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { localDataCache } from '@/libs/swr/localDataCache';
import { CACHE_TIERS, createCacheProvider } from '@/libs/swr/localStorageProvider';
import { messageService } from '@/services/message';

import { useToolResultPayload } from './useToolResultPayload';

const SCOPE = 'tool-payload-user:personal';

/** The production tier config, with a short debounce so writes land quickly. */
const makeProvider = () =>
  createCacheProvider({
    debounceMs: 5,
    getScope: () => SCOPE,
    idbEntryLimits: [...CACHE_TIERS.idbLimits],
    idbPatterns: [...CACHE_TIERS.idb],
    localPatterns: [...CACHE_TIERS.local],
  });

const wrapper =
  (provider: ReturnType<typeof createCacheProvider>) =>
  ({ children }: PropsWithChildren) =>
    createElement(
      SWRConfig,
      { value: { provider: provider as unknown as (c: Readonly<Cache>) => Cache } },
      children,
    );

describe('useToolResultPayload persistence', () => {
  afterEach(async () => {
    vi.restoreAllMocks();
    await localDataCache.clearScope(SCOPE);
  });

  it('serves the stored payload immediately after a reload, then revalidates', async () => {
    const payload = { content: '# page body', pluginState: { url: 'https://example.com' } };

    // --- session 1: the card fetches the projected payload -----------------
    vi.spyOn(messageService, 'getToolResultPayload').mockResolvedValue(payload as any);
    const p1 = makeProvider();
    await p1.hydrateScope?.();
    const r1 = renderHook(() => useToolResultPayload('msg-1', true), { wrapper: wrapper(p1) });
    await waitFor(() => expect(r1.result.current.payload).toEqual(payload));
    await waitFor(async () => {
      expect((await localDataCache.entriesByScope(SCOPE)).length).toBeGreaterThan(0);
    });
    r1.unmount();

    // --- session 2 ("reload"): the network is slow -------------------------
    let resolveSlow: (v: unknown) => void;
    const slow = new Promise((r) => {
      resolveSlow = r;
    });
    const fetch = vi.spyOn(messageService, 'getToolResultPayload').mockReturnValue(slow as any);
    const p2 = makeProvider();
    await p2.hydrateScope?.();
    const r2 = renderHook(() => useToolResultPayload('msg-1', true), { wrapper: wrapper(p2) });

    // first paint uses the persisted copy: no skeleton
    expect(r2.result.current).toEqual({ isLoading: false, payload });

    // and the server copy still revalidates behind it
    await waitFor(() => expect(fetch).toHaveBeenCalledWith('msg-1'));
    const fresh = { content: '# fresh body' };
    resolveSlow!(fresh);
    await waitFor(() => expect(r2.result.current.payload).toEqual(fresh));
  });

  it('keeps payloads over the size cap memory-only', async () => {
    const huge = { content: 'x'.repeat(200 * 1024) };
    vi.spyOn(messageService, 'getToolResultPayload').mockResolvedValue(huge as any);
    const p1 = makeProvider();
    await p1.hydrateScope?.();
    const r1 = renderHook(() => useToolResultPayload('msg-big', true), { wrapper: wrapper(p1) });
    await waitFor(() => expect(r1.result.current.payload).toEqual(huge));
    await new Promise((r) => setTimeout(r, 50));

    expect(await localDataCache.entriesByScope(SCOPE)).toEqual([]);
  });
});
