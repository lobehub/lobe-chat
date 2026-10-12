import { renderHook } from '@testing-library/react';
import { createElement, type ReactNode, useEffect } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useInitLibraryTree } from './useInitLibraryTree';

const { mockInit, resourceManagerState } = vi.hoisted(() => ({
  mockInit: vi.fn(),
  resourceManagerState: { libraryId: undefined as string | undefined },
}));

vi.mock('@/store/tree', () => ({
  useTreeStore: (selector: (s: { init: typeof mockInit }) => unknown) =>
    selector({ init: mockInit }),
}));

vi.mock('@/features/ResourceManager/store', () => ({
  useResourceManagerStore: (selector: (s: typeof resourceManagerState) => unknown) =>
    selector(resourceManagerState),
}));

const routeWrapper =
  (path: string, pattern = '/resource/library/:id/*') =>
  ({ children }: { children: ReactNode }) =>
    createElement(
      MemoryRouter,
      { initialEntries: [path] },
      createElement(Routes, null, createElement(Route, { element: children, path: pattern })),
    );

describe('useInitLibraryTree', () => {
  beforeEach(() => {
    mockInit.mockReset();
    resourceManagerState.libraryId = undefined;
  });

  it('initialises the tree from the route before the page syncs the library into the store', () => {
    const { result } = renderHook(() => useInitLibraryTree(), {
      wrapper: routeWrapper('/resource/library/kb-1/some-folder'),
    });

    expect(result.current).toBe('kb-1');
    expect(mockInit).toHaveBeenCalledWith('kb-1');
  });

  it('initialises before passive effects, so the seeded tree is in the first painted frame', () => {
    const order: string[] = [];
    mockInit.mockImplementation(() => order.push('init'));

    renderHook(
      () => {
        useInitLibraryTree();
        useEffect(() => {
          order.push('passive effect');
        }, []);
      },
      { wrapper: routeWrapper('/resource/library/kb-1') },
    );

    expect(order).toEqual(['init', 'passive effect']);
  });

  it('falls back to the store outside a library route', () => {
    resourceManagerState.libraryId = 'kb-2';

    const { result } = renderHook(() => useInitLibraryTree(), {
      wrapper: routeWrapper('/resource', '/resource'),
    });

    expect(result.current).toBe('kb-2');
    expect(mockInit).toHaveBeenCalledWith('kb-2');
  });
});
