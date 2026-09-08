import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { createElement, type PropsWithChildren } from 'react';
import { SWRConfig } from 'swr';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { DynamicRouteMeta } from '@/spa/router/routeMeta';

import { useAgentShareVisitorRouteMeta } from './useAgentShareVisitorRouteMeta';
import { useSharedAgent } from './useSharedAgent';

const { getSharedAgent } = vi.hoisted(() => ({ getSharedAgent: vi.fn() }));

vi.mock('@/services/agentShare', () => ({ agentShareService: { getSharedAgent } }));

const createWrapper = () => {
  const cache = new Map();

  return ({ children }: PropsWithChildren) =>
    createElement(
      SWRConfig,
      { value: { dedupingInterval: 0, provider: () => cache, shouldRetryOnError: false } },
      children,
    );
};

describe('useAgentShareVisitorRouteMeta', () => {
  afterEach(() => {
    cleanup();
    vi.resetAllMocks();
  });

  it('resolves the agent name from the same request as the visitor page', async () => {
    let resolveAgent!: (data: { agentMeta: { name: string; title: string } }) => void;
    getSharedAgent.mockReturnValue(
      new Promise((resolve) => {
        resolveAgent = resolve;
      }),
    );
    const onResolve = vi.fn<(meta: DynamicRouteMeta) => void>();

    renderHook(
      () => {
        useSharedAgent('alice');
        useAgentShareVisitorRouteMeta({ onResolve, params: { slugOrId: 'alice' } });
      },
      { wrapper: createWrapper() },
    );

    expect(onResolve.mock.lastCall?.[0].title).toBeUndefined();

    await act(async () => {
      resolveAgent({ agentMeta: { name: 'Alice', title: 'Writing Assistant' } });
    });

    await waitFor(() => expect(onResolve.mock.lastCall?.[0].title).toBe('Alice'));
    expect(getSharedAgent).toHaveBeenCalledTimes(1);
  });

  it('reads cached metadata without counting another view when the title mounts later', async () => {
    getSharedAgent.mockResolvedValue({ agentMeta: { name: 'Alice' } });
    const wrapper = createWrapper();
    const page = renderHook(() => useSharedAgent('alice'), { wrapper });

    await waitFor(() => expect(page.result.current.data).toBeDefined());
    page.unmount();

    const onResolve = vi.fn<(meta: DynamicRouteMeta) => void>();
    renderHook(() => useAgentShareVisitorRouteMeta({ onResolve, params: { slugOrId: 'alice' } }), {
      wrapper,
    });

    await waitFor(() => expect(onResolve.mock.lastCall?.[0].title).toBe('Alice'));
    expect(getSharedAgent).toHaveBeenCalledTimes(1);
  });

  it.each([
    [{ name: '', title: 'Writing Assistant' }, 'Writing Assistant'],
    [{ name: ' ', title: ' ' }, undefined],
    [{}, undefined],
  ])('resolves display name or allows the static fallback for %j', async (agentMeta, title) => {
    getSharedAgent.mockResolvedValue({ agentMeta });
    const onResolve = vi.fn<(meta: DynamicRouteMeta) => void>();

    const { result } = renderHook(
      () => {
        const shared = useSharedAgent('alice');
        useAgentShareVisitorRouteMeta({ onResolve, params: { slugOrId: 'alice' } });
        return shared;
      },
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(result.current.data).toBeDefined());
    expect(onResolve.mock.lastCall?.[0].title).toBe(title);
  });

  it('clears the previous agent name when navigating to an unavailable share', async () => {
    getSharedAgent.mockResolvedValueOnce({ agentMeta: { name: 'Alice' } });
    getSharedAgent.mockRejectedValueOnce(new Error('Share unavailable'));
    const onResolve = vi.fn<(meta: DynamicRouteMeta) => void>();

    const { rerender, result } = renderHook(
      ({ slugOrId }) => {
        const shared = useSharedAgent(slugOrId);
        useAgentShareVisitorRouteMeta({ onResolve, params: { slugOrId } });
        return shared;
      },
      { initialProps: { slugOrId: 'alice' }, wrapper: createWrapper() },
    );

    await waitFor(() => expect(onResolve.mock.lastCall?.[0].title).toBe('Alice'));
    rerender({ slugOrId: 'unavailable' });
    await waitFor(() => expect(result.current.error).toBeDefined());
    expect(onResolve.mock.lastCall?.[0].title).toBeUndefined();
  });

  it('falls back after a failed refresh even when SWR retains cached metadata', async () => {
    getSharedAgent.mockResolvedValue({ agentMeta: { name: 'Alice' } });
    const onResolve = vi.fn<(meta: DynamicRouteMeta) => void>();

    const { result } = renderHook(
      () => {
        const shared = useSharedAgent('alice');
        useAgentShareVisitorRouteMeta({ onResolve, params: { slugOrId: 'alice' } });
        return shared;
      },
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(onResolve.mock.lastCall?.[0].title).toBe('Alice'));
    getSharedAgent.mockRejectedValue(new Error('Share unavailable'));
    await act(async () => {
      await result.current.mutate();
    });

    expect(result.current.data?.agentMeta.name).toBe('Alice');
    await waitFor(() => expect(onResolve.mock.lastCall?.[0].title).toBeUndefined());
  });
});
