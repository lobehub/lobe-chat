import type { RouteObject } from 'react-router';

import { goalDetailRouteMeta, goalsRouteMeta } from '@/features/AgentGoals/routeMeta';
import { taskRouteMeta, tasksRouteMeta } from '@/features/AgentTasks/routeMeta';
import { scheduledTaskListLoader } from '@/spa/router/scheduledTaskListLoader';
import { dynamicElement, ErrorBoundary } from '@/utils/router';

/**
 * The cross-agent task workspace: `/tasks` and `/goals`, and the bare
 * `/task/:taskId` and `/goal/:goalId` details they open. Mounted under the
 * workspace layout in `desktopRouter.shared.tsx`.
 */
export const taskWorkspaceChildren: RouteObject[] = [
  {
    children: [
      {
        element: dynamicElement(() => import('@/routes/(main)/tasks'), 'Desktop > Tasks', {
          preloadId: 'tasks',
        }),
        handle: { meta: tasksRouteMeta },
        index: true,
        loader: scheduledTaskListLoader,
      },
    ],
    errorElement: <ErrorBoundary resetPath=".." />,
    path: 'tasks',
  },
  {
    children: [
      {
        element: dynamicElement(() => import('@/routes/(main)/goals'), 'Desktop > Goals'),
        handle: { meta: goalsRouteMeta },
        index: true,
      },
    ],
    errorElement: <ErrorBoundary resetPath=".." />,
    path: 'goals',
  },
  {
    children: [
      {
        element: dynamicElement(
          () => import('@/routes/(main)/task/[taskId]'),
          'Desktop > Task Detail',
        ),
        handle: { meta: taskRouteMeta },
        // Optional readable title tail — see the agent-scoped `task/:taskId/:slug?`
        // route in `desktopRouter.shared.tsx`.
        path: ':taskId/:slug?',
      },
    ],
    errorElement: <ErrorBoundary resetPath="../tasks" />,
    path: 'task',
  },
  {
    children: [
      {
        element: dynamicElement(
          () => import('@/routes/(main)/goal/[goalId]'),
          'Desktop > Goal Detail',
        ),
        handle: { meta: goalDetailRouteMeta },
        path: ':goalId',
      },
    ],
    errorElement: <ErrorBoundary resetPath="../goals" />,
    path: 'goal',
  },
];
