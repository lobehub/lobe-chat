'use client';

import { memo } from 'react';

import { DisplayContextMemory } from '@/database/repositories/userMemory';
import { useUserMemoryStore } from '@/store/userMemory';

import { TimelineView as GenericTimelineView } from '../../../../features/TimeLineView';
import { PeriodHeader, TimelineItemWrapper } from '../../../../features/TimeLineView/PeriodGroup';
import ContextCard from './ContextCard';

interface ContextTimelineViewProps {
  contexts: DisplayContextMemory[];
  onClick?: (context: DisplayContextMemory) => void;
  onDelete?: (id: string) => void;
  onEdit?: (id: string) => void;
}

const ContextTimelineView = memo<ContextTimelineViewProps>(
  ({ contexts, onClick, onDelete, onEdit }) => {
    const loadMoreContexts = useUserMemoryStore((s) => s.loadMoreContexts);
    const contextsHasMore = useUserMemoryStore((s) => s.contextsHasMore);
    const contextsIsLoading = useUserMemoryStore((s) => s.contextsIsLoading);

    return (
      <GenericTimelineView
        data={contexts}
        groupBy="day"
        hasMore={contextsHasMore}
        isLoading={contextsIsLoading}
        onLoadMore={loadMoreContexts}
        renderHeader={(periodKey, itemCount) => (
          <PeriodHeader groupBy="day" itemCount={itemCount} periodKey={periodKey} />
        )}
        renderItem={(context) => (
          <TimelineItemWrapper>
            <ContextCard
              context={context}
              onClick={() => onClick?.(context)}
              onDelete={onDelete}
              onEdit={onEdit}
            />
          </TimelineItemWrapper>
        )}
      />
    );
  },
);

export default ContextTimelineView;
