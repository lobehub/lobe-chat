import { MicIcon } from 'lucide-react';
import type { RouteObject } from 'react-router';

import { createSurfaceSkeleton } from '@/components/Skeleton/Surface';
import type { RouteMeta } from '@/spa/router/routeMeta';
import { routeMeta } from '@/spa/router/routeMeta';
import { dynamicElement, ErrorBoundary } from '@/utils/router';

const meetingMeta = (Skeleton: RouteMeta['Skeleton']) => ({
  meta: routeMeta({ icon: MicIcon, Skeleton, titleKey: 'navigation.meeting' }),
});

/**
 * `/meeting` records a meeting with its live transcript; `/meeting/:meetingId`
 * shows one meeting's transcript. Mounted in `desktopRouter.shared.tsx`.
 */
export const meetingRoutes: RouteObject[] = [
  {
    children: [
      {
        element: dynamicElement(() => import('@/routes/(main)/meeting'), 'Desktop > Meeting'),
        handle: meetingMeta(createSurfaceSkeleton('form')),
        index: true,
      },
      {
        element: dynamicElement(
          () => import('@/routes/(main)/meeting/[meetingId]'),
          'Desktop > Meeting > Detail',
        ),
        handle: meetingMeta(createSurfaceSkeleton('detail')),
        path: ':meetingId',
      },
    ],
    errorElement: <ErrorBoundary resetPath=".." />,
    path: 'meeting',
  },
];
