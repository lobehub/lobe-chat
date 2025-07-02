'use client';

import { ActionIcon } from '@lobehub/ui';
import { Plus } from 'lucide-react';
import { memo } from 'react';

const NewTopicButton = memo(({ onClick }: { onClick: () => void }) => {
  return (
    <ActionIcon
      icon={Plus}
      onClick={onClick}
      size={{
        blockSize: 48,
      }}
      variant={'filled'}
    />
  );
});

NewTopicButton.displayName = 'NewTopicButton';

export default NewTopicButton;
