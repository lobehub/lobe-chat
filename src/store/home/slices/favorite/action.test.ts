/**
 * @vitest-environment happy-dom
 *
 * Sidebar favorites are a replica list. A star click shows up in the sidebar
 * before the server answers, a refused write puts the list back, and a
 * renamed target rewrites its snapshot only when something changed.
 */
import { randomUUID } from 'node:crypto';

import type { FavoriteItem } from '@lobechat/types';
import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { createElement, useEffect } from 'react';
import { SWRConfig, useSWRConfig } from 'swr';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { cacheScope } from '@/libs/replica';
import { setScopedMutate } from '@/libs/swr/mutate';
import { favoriteService } from '@/services/favorite';
import { useHomeStore } from '@/store/home';
import { favoriteSelectors } from '@/store/home/selectors';

import { initialFavoriteState } from './initialState';
import { favoriteListResource } from './projection';

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

const favorite = (targetId: string, overrides: Partial<FavoriteItem> = {}): FavoriteItem => ({
  icon: null,
  id: `fav_${targetId}`,
  path: `/page/${targetId}`,
  targetId,
  title: targetId,
  type: 'page',
  ...overrides,
});

const STORAGE_KEY = favoriteListResource.storageKey({});

const renderSync = () =>
  renderHook(() => useHomeStore((s) => s.useFetchFavorites)(true), { wrapper });

const list = () => favoriteSelectors.favorites(useHomeStore.getState());

describe('favorite slice', () => {
  const scopes = new Set<string>();

  beforeEach(() => {
    const scope = `favorite-user-${randomUUID()}:personal`;
    scopes.add(scope);
    vi.spyOn(cacheScope, 'get').mockImplementation(() => scope);
    vi.spyOn(cacheScope, 'use').mockImplementation(() => scope);
    vi.spyOn(cacheScope, 'canPersist').mockReturnValue(true);
    useHomeStore.setState({ ...initialFavoriteState });
  });

  afterEach(async () => {
    cleanup();
    await Promise.all(
      [...scopes].map((scope) =>
        favoriteListResource.storage!.remove({ queryKey: STORAGE_KEY, scope }),
      ),
    );
    scopes.clear();
    vi.restoreAllMocks();
  });

  const loadWith = async (items: FavoriteItem[]) => {
    vi.spyOn(favoriteService, 'list').mockResolvedValue(items);
    renderSync();
    await waitFor(() =>
      expect(favoriteSelectors.favoriteList(useHomeStore.getState())).toBeDefined(),
    );
  };

  it('shows a new favorite before the server answers, then keeps the saved row', async () => {
    await loadWith([favorite('a')]);
    let resolveAdd!: (item: FavoriteItem) => void;
    const add = vi
      .spyOn(favoriteService, 'add')
      .mockImplementation(() => new Promise((resolve) => (resolveAdd = resolve)));

    let toggled!: Promise<void>;
    act(() => {
      toggled = useHomeStore
        .getState()
        .toggleFavorite({ path: '/page/b', targetId: 'b', title: 'B', type: 'page' });
    });

    expect(list().map((item) => item.targetId)).toEqual(['a', 'b']);

    await waitFor(() => expect(add).toHaveBeenCalled());
    await act(async () => {
      resolveAdd(favorite('b', { title: 'B' }));
      await toggled;
    });
    expect(list()[1]).toEqual(favorite('b', { title: 'B' }));
  });

  it('puts a removed favorite back when the server refuses', async () => {
    await loadWith([favorite('a'), favorite('b')]);
    vi.spyOn(favoriteService, 'removeByTarget').mockRejectedValue(new Error('offline'));

    await act(async () => {
      await expect(
        useHomeStore
          .getState()
          .toggleFavorite({ path: '/page/a', targetId: 'a', title: 'a', type: 'page' }),
      ).rejects.toThrow('offline');
    });

    expect(list().map((item) => item.targetId)).toEqual(['a', 'b']);
  });

  it('reorders right away and sends the new order', async () => {
    await loadWith([favorite('a'), favorite('b'), favorite('c')]);
    const reorder = vi.spyOn(favoriteService, 'reorder').mockResolvedValue();

    await act(() => useHomeStore.getState().reorderFavorites(['fav_c', 'fav_a', 'fav_b']));

    expect(list().map((item) => item.targetId)).toEqual(['c', 'a', 'b']);
    expect(reorder).toHaveBeenCalledWith(['fav_c', 'fav_a', 'fav_b']);
  });

  it('rewrites a snapshot only when the target changed', async () => {
    await loadWith([favorite('a', { title: 'Old' })]);
    const update = vi.spyOn(favoriteService, 'update').mockResolvedValue();

    await act(() =>
      useHomeStore.getState().syncFavoriteSnapshot('page', 'a', { icon: null, title: 'Old' }),
    );
    expect(update).not.toHaveBeenCalled();

    await act(() => useHomeStore.getState().syncFavoriteSnapshot('page', 'a', { title: 'New' }));
    expect(update).toHaveBeenCalledWith('fav_a', { title: 'New' });
    expect(list()[0].title).toBe('New');
  });
});
