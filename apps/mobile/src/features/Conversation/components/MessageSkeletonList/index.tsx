import { Flexbox } from '@lobehub/ui-rn';
import { memo } from 'react';

import MessageSkeleton from '../MessageSkeleton';

const MessageSkeletonList = memo(() => {
  return (
    <Flexbox flex={1} padding={16}>
      <MessageSkeleton role="assistant" width={['100%', '90%', '100%', '90%', '100%', '60%']} />
    </Flexbox>
  );
});

export default MessageSkeletonList;
