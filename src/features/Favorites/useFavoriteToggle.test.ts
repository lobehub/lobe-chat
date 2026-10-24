/**
 * @vitest-environment happy-dom
 */
import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  FAVORITE_SNAPSHOT_SYNC_DELAY,
  type FavoriteTarget,
  useFavoriteToggle,
} from './useFavoriteToggle';

const store = vi.hoisted(() => ({
  favoriteId: undefined as string | undefined,
  syncFavoriteSnapshot: vi.fn(),
  toggleFavorite: vi.fn(),
}));

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
vi.mock('./useFetchFavorites', () => ({ useFetchFavorites: () => ({}) }));
vi.mock('@/store/home/selectors', () => ({
  favoriteSelectors: {
    getFavorite: () => () => (store.favoriteId ? { id: store.favoriteId } : undefined),
  },
}));
vi.mock('@/store/home', () => ({
  useHomeStore: (selector: (s: unknown) => unknown) =>
    selector({
      syncFavoriteSnapshot: store.syncFavoriteSnapshot,
      toggleFavorite: store.toggleFavorite,
    }),
}));

const target = (title: string): FavoriteTarget => ({
  path: '/page/docs_a',
  targetId: 'docs_a',
  title,
  type: 'page',
});

describe('useFavoriteToggle snapshot sync', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    store.favoriteId = 'fav_a';
    store.syncFavoriteSnapshot.mockReset().mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('writes a title typed character by character once it settles', () => {
    const { rerender } = renderHook(({ title }) => useFavoriteToggle(target(title)), {
      initialProps: { title: 'S' },
    });
    for (const title of ['Sp', 'Spe', 'Spec']) {
      act(() => vi.advanceTimersByTime(100));
      rerender({ title });
    }

    act(() => vi.advanceTimersByTime(FAVORITE_SNAPSHOT_SYNC_DELAY));

    expect(store.syncFavoriteSnapshot).toHaveBeenCalledTimes(1);
    expect(store.syncFavoriteSnapshot).toHaveBeenLastCalledWith(
      'page',
      'docs_a',
      expect.objectContaining({ title: 'Spec' }),
    );
  });

  it('replays a rename made while the add was pending once the add is confirmed', () => {
    store.favoriteId = 'optimistic:page:docs_a';
    const { rerender } = renderHook(({ title }) => useFavoriteToggle(target(title)), {
      initialProps: { title: 'Renamed' },
    });
    act(() => vi.advanceTimersByTime(FAVORITE_SNAPSHOT_SYNC_DELAY));
    store.syncFavoriteSnapshot.mockClear();

    // The confirmed row arrives with the snapshot sent at add time.
    store.favoriteId = 'fav_a';
    rerender({ title: 'Renamed' });
    act(() => vi.advanceTimersByTime(FAVORITE_SNAPSHOT_SYNC_DELAY));

    expect(store.syncFavoriteSnapshot).toHaveBeenCalledWith(
      'page',
      'docs_a',
      expect.objectContaining({ title: 'Renamed' }),
    );
  });
});
