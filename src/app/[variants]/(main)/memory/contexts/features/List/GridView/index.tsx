import { memo } from 'react';

import { DisplayContextMemory } from '@/database/repositories/userMemory';
import { useUserMemoryStore } from '@/store/userMemory';

import { GridView } from '../../../../features/GridView';
import ContextCard from './ContextCard';

interface GridViewProps {
  contexts: DisplayContextMemory[];
  isLoading?: boolean;
  onClick: (context: DisplayContextMemory) => void;
  onDelete?: (id: string) => void;
  onEdit?: (id: string) => void;
}

const ContextsGridView = memo<GridViewProps>(
  ({ contexts, isLoading, onClick, onDelete, onEdit }) => {
    const loadMoreContexts = useUserMemoryStore((s) => s.loadMoreContexts);
    const contextsHasMore = useUserMemoryStore((s) => s.contextsHasMore);

    return (
      <GridView
        defaultColumnCount={2}
        hasMore={contextsHasMore}
        isLoading={isLoading}
        items={contexts}
        onLoadMore={loadMoreContexts}
        renderItem={(context, actions) => (
          <ContextCard
            context={context}
            onClick={() => onClick(context)}
            onDelete={actions.onDelete || onDelete}
            onEdit={actions.onEdit || onEdit}
          />
        )}
      />
    );
  },
);

export default ContextsGridView;
