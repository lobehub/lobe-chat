import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useSelfLearningSurface } from './useSelfLearningSurface';

const state = vi.hoisted(() => ({
  enableSelfLearning: false,
  isUserStateInit: true,
}));

// The retired `agent_self_iteration` rollout flag must no longer open the surfaces.
vi.mock('@/store/serverConfig', () => {
  const serverState = { enableAgentSelfIteration: true, serverConfigInit: true };
  return {
    serverConfigSelectors: {
      enableAgentSelfIteration: (s: typeof serverState) => s.enableAgentSelfIteration,
    },
    useServerConfigStore: (selector: (s: typeof serverState) => unknown) => selector(serverState),
  };
});

vi.mock('@/store/user', () => ({
  useUserStore: (selector: (s: typeof state) => unknown) => selector(state),
}));

vi.mock('@/store/user/selectors', () => ({
  labPreferSelectors: { enableSelfLearning: (s: typeof state) => s.enableSelfLearning },
}));

beforeEach(() => {
  state.enableSelfLearning = false;
  state.isUserStateInit = true;
});

describe('useSelfLearningSurface', () => {
  it('turns the review surfaces on with the Labs switch', () => {
    state.enableSelfLearning = true;

    const { result } = renderHook(() => useSelfLearningSurface());

    expect(result.current).toEqual({ enabled: true, ready: true });
  });

  it('stays off while the Labs switch is off, whatever the old rollout flag says', () => {
    const { result } = renderHook(() => useSelfLearningSurface());

    expect(result.current).toEqual({ enabled: false, ready: true });
  });

  /**
   * The Labs preference arrives with the user state, not the server config; gated pages must
   * not flash the "turn on in Labs" state before it loads.
   */
  it('reports not ready until the user state has loaded', () => {
    state.isUserStateInit = false;

    const { result } = renderHook(() => useSelfLearningSurface());

    expect(result.current.ready).toBe(false);
  });
});
