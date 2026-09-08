import { MessageSquareShareIcon } from 'lucide-react';
import { lazy } from 'react';

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
