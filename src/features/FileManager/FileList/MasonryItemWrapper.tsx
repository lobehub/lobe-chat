import { memo } from 'react';

import { FileListItem } from '@/types/files';

import MasonryFileItem from './MasonryFileItem';

interface MasonryItemWrapperProps {
  context: {
    knowledgeBaseId?: string;
    selectFileIds: string[];
    setSelectedFileIds: (updater: (prev: string[]) => string[]) => void;
  };
  data: FileListItem;
  index: number;
}

const MasonryItemWrapper = memo<MasonryItemWrapperProps>(({ data: item, context }) => {
  return (
    <div style={{ padding: '8px' }}>
      <MasonryFileItem
        knowledgeBaseId={context.knowledgeBaseId}
        onSelectedChange={(id, checked) => {
          context.setSelectedFileIds((prev: string[]) => {
            if (checked) {
              return [...prev, id];
            }
            return prev.filter((item) => item !== id);
          });
        }}
        selected={context.selectFileIds.includes(item.id)}
        {...item}
      />
    </div>
  );
});

MasonryItemWrapper.displayName = 'MasonryItemWrapper';

export default MasonryItemWrapper;
