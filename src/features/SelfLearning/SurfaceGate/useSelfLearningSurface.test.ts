import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useSelfLearningSurface } from './useSelfLearningSurface';

const state = vi.hoisted(() => ({
  enableAgentSelfIteration: false,
  enableSelfLearning: false,
  serverConfigInit: true,
}));

vi.mock('@/store/serverConfig', () => ({
  serverConfigSelectors: {
    enableAgentSelfIteration: (s: typeof state) => s.enableAgentSelfIteration,
  },
  useServerConfigStore: (selector: (s: typeof state) => unknown) => selector(state),
}));

vi.mock('@/store/user', () => ({
  useUserStore: (selector: (s: typeof state) => unknown) => selector(state),
}));

vi.mock('@/store/user/selectors', () => ({
  labPreferSelectors: { enableSelfLearning: (s: typeof state) => s.enableSelfLearning },
}));

beforeEach(() => {
  state.enableAgentSelfIteration = false;
  state.enableSelfLearning = false;
  state.serverConfigInit = true;
});

describe('useSelfLearningSurface', () => {
  it('turns the review surfaces on for the self-iteration rollout without the labs toggle', () => {
    state.enableAgentSelfIteration = true;

    const { result } = renderHook(() => useSelfLearningSurface());

    expect(result.current).toEqual({ enabled: true, ready: true });
  });

  it('keeps the labs toggle working outside the rollout', () => {
    state.enableSelfLearning = true;

    const { result } = renderHook(() => useSelfLearningSurface());

    expect(result.current.enabled).toBe(true);
  });

  it('stays off when neither the rollout nor labs is on', () => {
    const { result } = renderHook(() => useSelfLearningSurface());

    expect(result.current).toEqual({ enabled: false, ready: true });
  });

  it('reports not ready until the server config has loaded', () => {
    state.serverConfigInit = false;

    const { result } = renderHook(() => useSelfLearningSurface());

    expect(result.current.ready).toBe(false);
  });
});
