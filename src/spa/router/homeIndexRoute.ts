import { HomeIcon } from 'lucide-react';
import { createElement, type ReactElement } from 'react';
import type { RouteObject } from 'react-router';

import { workspaceHomeRouteMeta } from '@/features/Workspace/routeMeta';

import { homeTopicRecentsLoader } from './homeTopicRecentsLoader';
import { NoRouteSkeleton, routeMeta } from './routeMeta';

const personalHomeRouteMeta = routeMeta({
  icon: HomeIcon,
  Skeleton: NoRouteSkeleton,
  tabTitleKey: 'navigation.home',
  titleKey: 'navigation.home',
});

/**
 * The Home index route of the personal (`/`) or workspace (`/:workspaceSlug`)
 * tree. Web renders Home beside the router outlet and leaves the element empty;
 * Electron injects a per-tab Home element because each tab owns an independent
 * memory router. Both seed the persisted recent topics before the route commits.
 */
export const createHomeIndexRoute = (
  space: 'personal' | 'workspace',
  createHomeElement?: () => ReactElement,
): RouteObject => ({
  element: createHomeElement ? createElement(createHomeElement) : undefined,
  handle: { meta: space === 'workspace' ? workspaceHomeRouteMeta : personalHomeRouteMeta },
  index: true,
  loader: homeTopicRecentsLoader,
});
