import { MessageSquareShareIcon } from 'lucide-react';
import { lazy } from 'react';

import AgentShareProfileSkeleton from '@/components/Skeleton/AgentShareProfile';
import AgentShareVisitorSkeleton from '@/components/Skeleton/AgentShareVisitor';
import { routeMeta } from '@/spa/router/routeMeta';

/**
 * Keep visitor data fetching out of the initial router chunk. The static share
 * label remains the fallback until the visitor-facing metadata is available.
 */
export const agentShareVisitorRouteMeta = routeMeta({
  DynamicMeta: lazy(() => import('./useAgentShareVisitorRouteMeta')),
  icon: MessageSquareShareIcon,
  Skeleton: AgentShareVisitorSkeleton,
  titleKey: 'navigation.sharedAgent',
});

/**
 * The profile is a different shape from the conversation, so it carries its
 * own skeleton — reusing the conversation's would jump the layout on arrival.
 * Title and icon resolution is shared.
 */
export const agentShareProfileRouteMeta = routeMeta({
  DynamicMeta: lazy(() => import('./useAgentShareVisitorRouteMeta')),
  icon: MessageSquareShareIcon,
  Skeleton: AgentShareProfileSkeleton,
  titleKey: 'navigation.sharedAgent',
});
