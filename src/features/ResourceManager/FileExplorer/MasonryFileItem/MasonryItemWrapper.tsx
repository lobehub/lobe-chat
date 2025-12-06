import { memo, useCallback } from 'react';

import { FileListItem } from '@/types/files';

import MasonryFileItem from '.';

interface MasonryItemWrapperProps {
  context: {
    knowledgeBaseId?: string;
    openFile?: (id: string) => void;
    selectFileIds: string[];
    setSelectedFileIds: (ids: string[]) => void;
  };
  data: FileListItem;
  index: number;
}

const MasonryItemWrapper = memo<MasonryItemWrapperProps>(
  ({ data: item, context }) => {
    // Always call hooks at the top level
    const handleSelectedChange = useCallback(
      (id: string, checked: boolean) => {
        if (checked) {
          context.setSelectedFileIds([...context.selectFileIds, id]);
        } else {
          context.setSelectedFileIds(context.selectFileIds.filter((item) => item !== id));
        }
      },
      [context.selectFileIds, context.setSelectedFileIds],
    );

    // Safety check: return null if item is undefined (can happen during deletion)
    if (!item || !item.id) {
      return null;
    }

    return (
      <div style={{ padding: '8px 4px' }}>
        <MasonryFileItem
          knowledgeBaseId={context.knowledgeBaseId}
          onOpen={context.openFile}
          onSelectedChange={handleSelectedChange}
          selected={context.selectFileIds.includes(item.id)}
          {...item}
        />
      </div>
    );
  },
  // Custom comparison to avoid unnecessary re-renders
  (prevProps, nextProps) => {
    // Re-render if item changed
    if (prevProps.data.id !== nextProps.data.id) return false;
    // Re-render if selection changed for this item
    const wasSelected = prevProps.context.selectFileIds.includes(prevProps.data.id);
    const isSelected = nextProps.context.selectFileIds.includes(nextProps.data.id);
    if (wasSelected !== isSelected) return false;
    // Re-render if item data changed (check key properties)
    if (
      prevProps.data.name !== nextProps.data.name ||
      prevProps.data.chunkingStatus !== nextProps.data.chunkingStatus ||
      prevProps.data.embeddingStatus !== nextProps.data.embeddingStatus
    ) {
      return false;
    }
    // Otherwise, don't re-render
    return true;
  },
);

MasonryItemWrapper.displayName = 'MasonryItemWrapper';

export default MasonryItemWrapper;
