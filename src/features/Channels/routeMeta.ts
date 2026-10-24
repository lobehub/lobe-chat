import { Hash } from 'lucide-react';

import ConversationSegmentSkeleton from '@/components/Skeleton/Conversation/Segment';
import { routeMeta } from '@/spa/router/routeMeta';

export const channelRouteMeta = routeMeta({
  icon: Hash,
  Skeleton: ConversationSegmentSkeleton,
  titleKey: 'channel:title',
});
