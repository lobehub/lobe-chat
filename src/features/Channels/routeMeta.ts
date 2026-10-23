import { Hash } from 'lucide-react';

import ConversationSegmentSkeleton from '@/components/Skeleton/Conversation/Segment';
import { createSurfaceSkeleton } from '@/components/Skeleton/Surface';
import { routeMeta } from '@/spa/router/routeMeta';

export const channelsRouteMeta = routeMeta({
  icon: Hash,
  Skeleton: createSurfaceSkeleton('list'),
  titleKey: 'channel:title',
});
export const channelRouteMeta = routeMeta({
  icon: Hash,
  Skeleton: ConversationSegmentSkeleton,
  titleKey: 'channel:title',
});
