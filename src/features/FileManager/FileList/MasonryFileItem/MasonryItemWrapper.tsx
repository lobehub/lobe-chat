import { memo } from 'react';

import { FileListItem } from '@/types/files';

import MasonryFileItem from '.';

interface MasonryItemWrapperProps {
  context: {
    downloading: boolean;
    knowledgeBaseId?: string;
    openFile: (id: string) => void;
    selectFileIds: string[];
    setSelectedFileIds: (updater: (prev: string[]) => string[]) => void;
  };
  data: FileListItem;
  index: number;
}

const MasonryItemWrapper = memo<MasonryItemWrapperProps>(({ data: item, context }) => {
  // Safety check: return null if item is undefined (can happen during deletion)
  if (!item || !item.id) {
    return null;
  }

  return (
    <div style={{ padding: '8px 4px' }}>
      <MasonryFileItem
        downloading={context.downloading}
        knowledgeBaseId={context.knowledgeBaseId}
        onOpen={context.openFile}
        onSelectedChange={(id, checked) => {
          if (context.downloading) return;
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
