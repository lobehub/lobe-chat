import { BrainCircuit, Scale } from 'lucide-react';
import type { RouteObject } from 'react-router';

import MemorySkeleton from '@/components/Skeleton/Memory';
import { createSurfaceSkeleton } from '@/components/Skeleton/Surface';
import { activityListLoader } from '@/spa/router/activityListLoader';
import { contextListLoader } from '@/spa/router/contextListLoader';
import { identitiesListLoader } from '@/spa/router/identitiesListLoader';
import { preferenceListLoader } from '@/spa/router/preferenceListLoader';
import { routeMeta } from '@/spa/router/routeMeta';
import { dynamicElement, dynamicLayout, ErrorBoundary } from '@/utils/router';

/** The memory section (`/memory/*`). Mounted in `desktopRouter.shared.tsx`. */
export const memoryRoutes: RouteObject[] = [
  {
    children: [
      {
        element: dynamicElement(
          () => import('@/routes/(main)/memory/(home)'),
          'Desktop > Memory > Home',
          { preloadId: 'memory' },
        ),
        handle: {
          meta: routeMeta({
            icon: BrainCircuit,
            Skeleton: MemorySkeleton,
            titleKey: 'navigation.memory',
          }),
        },
        index: true,
      },
      {
        element: dynamicElement(
          () => import('@/routes/(main)/memory/identities'),
          'Desktop > Memory > Identities',
        ),
        handle: {
          meta: routeMeta({ icon: BrainCircuit, titleKey: 'navigation.memoryIdentities' }),
        },
        // Seed the persisted identity list before the page paints, so a cold
        // start shows the local copy instead of a loading state.
        loader: identitiesListLoader,
        path: 'identities',
      },
      {
        element: dynamicElement(
          () => import('@/routes/(main)/memory/contexts'),
          'Desktop > Memory > Contexts',
        ),
        handle: {
          meta: routeMeta({ icon: BrainCircuit, titleKey: 'navigation.memoryContexts' }),
        },
        // Seed the persisted head page before the page paints (see `contextListLoader`).
        loader: contextListLoader,
        path: 'contexts',
      },
      {
        element: dynamicElement(
          () => import('@/routes/(main)/memory/preferences'),
          'Desktop > Memory > Preferences',
        ),
        handle: {
          meta: routeMeta({ icon: BrainCircuit, titleKey: 'navigation.memoryPreferences' }),
        },
        loader: preferenceListLoader,
        path: 'preferences',
      },
      {
        element: dynamicElement(
          () => import('@/routes/(main)/memory/rules'),
          'Desktop > Memory > Rules',
        ),
        handle: {
          // Same icon the memory sidebar uses, so a desktop tab and the nav item agree.
          meta: routeMeta({ icon: Scale, titleKey: 'navigation.memoryRules' }),
        },
        path: 'rules',
      },
      {
        element: dynamicElement(
          () => import('@/routes/(main)/memory/activities'),
          'Desktop > Memory > Activities',
        ),
        handle: {
          meta: routeMeta({ icon: BrainCircuit, titleKey: 'navigation.memory' }),
        },
        // Seed the persisted head page before the page paints (see `activityListLoader`).
        loader: activityListLoader,
        path: 'activities',
      },
    ],
    element: dynamicLayout(
      () => import('@/routes/(main)/memory/_layout'),
      'Desktop > Memory > Layout',
      { preloadId: 'memory' },
    ),
    errorElement: <ErrorBoundary />,
    handle: { meta: routeMeta({ Skeleton: createSurfaceSkeleton('list') }) },
    path: 'memory',
  },
];
