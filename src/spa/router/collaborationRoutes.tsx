import type { RouteObject } from 'react-router';

import { agentsRouteMeta } from '@/features/AgentViewAll/routeMeta';
import { channelRouteMeta, channelsRouteMeta } from '@/features/Channels/routeMeta';
import { dashboardRouteMeta, dashboardsRouteMeta } from '@/features/Dashboard/routeMeta';
import { projectsRouteMeta } from '@/features/Projects/routeMeta';
import { dynamicElement, dynamicLayout, ErrorBoundary } from '@/utils/router';

export const collaborationRoutes: RouteObject[] = [
  // Agents view-all route (flat list of workspace/private agents)
  {
    children: [
      {
        element: dynamicElement(() => import('@/routes/(main)/agents'), 'Desktop > Agents', {
          preloadId: 'agents',
        }),
        handle: { meta: agentsRouteMeta },
        index: true,
      },
    ],
    errorElement: <ErrorBoundary resetPath=".." />,
    path: 'agents',
  },

  // Projects view-all route
  {
    children: [
      {
        element: dynamicElement(() => import('@/routes/(main)/projects'), 'Desktop > Projects', {
          preloadId: 'projects',
        }),
        handle: { meta: projectsRouteMeta },
        index: true,
      },
    ],
    errorElement: <ErrorBoundary resetPath=".." />,
    path: 'projects',
  },

  // Personal dashboards (free-form monitoring boards)
  {
    children: [
      {
        element: dynamicElement(() => import('@/routes/(main)/dashboard'), 'Desktop > Dashboards', {
          preloadId: 'dashboard',
        }),
        handle: { meta: dashboardsRouteMeta },
        index: true,
      },
      {
        element: dynamicElement(
          () => import('@/routes/(main)/dashboard/[dashboardId]'),
          'Desktop > Dashboard Detail',
          { preloadId: 'dashboard' },
        ),
        handle: { meta: dashboardRouteMeta },
        path: ':dashboardId',
      },
    ],
    // Personal-only, and off unless the `dashboard` feature flag is on: the gate
    // leaves for home inside a workspace or while the flag is off.
    element: dynamicLayout(
      () => import('@/routes/(main)/dashboard/_layout'),
      'Desktop > Dashboards > Layout',
      {
        preloadId: 'dashboard',
      },
    ),
    errorElement: <ErrorBoundary resetPath=".." />,
    path: 'dashboard',
  },
];

/** Channels sit under an Agent group's Channel tab; a thread opens beside its channel via `?thread=`. */
export const groupChannelRoutes: RouteObject[] = [
  {
    element: dynamicElement(
      () => import('@/routes/(main)/group/channel'),
      'Desktop > Agent Group > Channels',
      { preloadId: 'group' },
    ),
    handle: { meta: channelsRouteMeta },
    path: 'channel',
  },
  {
    element: dynamicElement(
      () => import('@/routes/(main)/group/channel/[channelId]'),
      'Desktop > Agent Group > Channel',
      { preloadId: 'group' },
    ),
    handle: { meta: channelRouteMeta },
    path: 'channel/:channelId',
  },
];
