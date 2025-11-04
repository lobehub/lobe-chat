import { Center, Divider, Flexbox, Skeleton } from '@lobehub/ui-rn';
import { memo } from 'react';

import MessageSkeletonList from '@/features/Conversation/components/MessageSkeletonList';

const AssistantDetailSkeleton = memo(() => {
  return (
    <Flexbox flex={1}>
      <Flexbox flex={1}>
        <Flexbox gap={16} padding={16}>
          <Center>
            <Skeleton.Avatar animated size={100} />
          </Center>
          <Skeleton.Paragraph animated rows={3} />
        </Flexbox>
        <Divider />
        <MessageSkeletonList />
      </Flexbox>
      <Flexbox padding={16}>
        <Skeleton.Button block />
      </Flexbox>
    </Flexbox>
  );
});

export default AssistantDetailSkeleton;
