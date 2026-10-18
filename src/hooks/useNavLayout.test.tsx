import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

interface GlobalStateMock {
  toggleCommandMenu: () => void;
}

const mocks = vi.hoisted(() => ({
  activeWorkspaceSlug: null as string | null,
  enableDashboard: false,
  showMarket: true,
  enableQuickNote: false,
}));

vi.mock('@/config/routes', () => ({
  getRouteById: (id: string) => ({
    icon: () => id,
  }),
}));

vi.mock('@/store/global', () => ({
  useGlobalStore: (selector: (state: GlobalStateMock) => unknown) =>
    selector({ toggleCommandMenu: vi.fn() }),
}));

const ENABLE_DASHBOARD = 'enableDashboard';
vi.mock('@/store/serverConfig', () => ({
  featureFlagsSelectors: 'featureFlags',
  serverConfigSelectors: { enableDashboard: ENABLE_DASHBOARD },
  useServerConfigStore: (selector: unknown) =>
    selector === ENABLE_DASHBOARD
      ? mocks.enableDashboard
      : { enableQuickNote: mocks.enableQuickNote, hideGitHub: false, showMarket: mocks.showMarket },
}));

vi.mock('@/business/client/hooks/useActiveWorkspaceSlug', () => ({
  useActiveWorkspaceSlug: () => mocks.activeWorkspaceSlug,
}));

describe('useNavLayout', () => {
  beforeEach(() => {
    mocks.activeWorkspaceSlug = null;
    mocks.showMarket = true;
    mocks.enableDashboard = false;
    mocks.enableQuickNote = false;
  });

  const dashboardItem = async () => {
    const { useNavLayout } = await import('./useNavLayout');
    const { result } = renderHook(() => useNavLayout());
    return result.current.topNavItems.find((item) => item.key === 'dashboard');
  };

  it('hides Dashboards while the dashboard feature flag is off', async () => {
    expect((await dashboardItem())?.hidden).toBe(true);
  });

  it('shows Dashboards in personal mode once the flag is on', async () => {
    mocks.enableDashboard = true;
    expect((await dashboardItem())?.hidden).toBe(false);

    mocks.activeWorkspaceSlug = 'lobe-team';
    expect((await dashboardItem())?.hidden).toBe(true);
  });

  it('keeps Memory visible in personal mode', async () => {
    const { useNavLayout } = await import('./useNavLayout');
    const { result } = renderHook(() => useNavLayout());

    const memoryItem = result.current.bottomMenuItems.find((item) => item.key === 'memory');

    expect(memoryItem?.hidden).not.toBe(true);
  });

  it('hides Memory in workspace mode', async () => {
    mocks.activeWorkspaceSlug = 'lobe-team';

    const { useNavLayout } = await import('./useNavLayout');
    const { result } = renderHook(() => useNavLayout());

    const memoryItem = result.current.bottomMenuItems.find((item) => item.key === 'memory');

    expect(memoryItem?.hidden).toBe(true);
  });
  /** @example Quick Note appears only after the server grants rollout access. */
  it('updates the Note entry when rollout access changes', async () => {
    const { useNavLayout } = await import('./useNavLayout');
    const { result, rerender } = renderHook(() => useNavLayout());
    /** @example Disabled users cannot see the note navigation entry. */
    expect(result.current.topNavItems.find((item) => item.key === 'note')?.hidden).toBe(true);
    mocks.enableQuickNote = true;
    rerender();
    /** @example Enabling the flag reveals the same navigation entry. */
    expect(result.current.topNavItems.find((item) => item.key === 'note')?.hidden).toBe(false);
  });
});
