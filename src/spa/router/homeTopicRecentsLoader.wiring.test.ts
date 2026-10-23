// @vitest-environment happy-dom
import type { RouteObject } from 'react-router';
import { describe, expect, it, vi } from 'vitest';

import { workspaceHomeRouteMeta } from '@/features/Workspace/routeMeta';

import { desktopRoutes } from './desktopRouter.config';
import { homeTopicRecentsLoader } from './homeTopicRecentsLoader';

const loaderModule = vi.hoisted(() => ({ evaluated: false }));

// Evaluating the real loader means the home store reached the entry chunk's
// first-screen graph through the route tables.
vi.mock('@/routes/(main)/home/homeTopicRecentsLoader', () => {
  loaderModule.evaluated = true;
  return { homeTopicRecentsLoader: vi.fn(async () => null) };
});

const flatten = (routes: RouteObject[]): RouteObject[] =>
  routes.flatMap((route) => [route, ...(route.children ? flatten(route.children) : [])]);

const isHomeRoute = (route: RouteObject) => {
  const meta = (route.handle as { meta?: { titleKey?: string } } | undefined)?.meta;
  return route.index && (meta === workspaceHomeRouteMeta || meta?.titleKey === 'navigation.home');
};

describe('home topic recents loader wiring', () => {
  it('does not load the store-backed loader while the route tables load', () => {
    expect(loaderModule.evaluated).toBe(false);
  });

  it('pre-hydrates the recent topics on the personal and workspace home routes', () => {
    const routes = flatten(desktopRoutes).filter(isHomeRoute);

    expect(routes.length).toBe(2);
    expect(routes.map((route) => route.loader)).toEqual(routes.map(() => homeTopicRecentsLoader));
  });

  it('delegates to the real loader on first use', async () => {
    const { homeTopicRecentsLoader: realLoader } =
      await import('@/routes/(main)/home/homeTopicRecentsLoader');

    await expect(homeTopicRecentsLoader()).resolves.toBeNull();
    expect(realLoader).toHaveBeenCalled();
  });
});
