'use client';

import { memo } from 'react';

import { DisplayContextMemory } from '@/database/repositories/userMemory';

import { TimelineView as GenericTimelineView } from '../../../../features/TimeLineView';
import { PeriodGroup } from '../../../../features/TimeLineView/PeriodGroup';
import ContextCard from './ContextCard';

interface ContextTimelineViewProps {
  contexts: DisplayContextMemory[];
  onClick?: (context: DisplayContextMemory) => void;
  onDelete?: (id: string) => void;
  onEdit?: (id: string) => void;
}

const ContextTimelineView = memo<ContextTimelineViewProps>(
  ({ contexts, onClick, onDelete, onEdit }) => {
    return (
      <GenericTimelineView
        data={contexts}
        groupBy="day"
        renderGroup={(periodKey, items) => (
          <PeriodGroup
            groupBy="day"
            items={items}
            periodKey={periodKey}
            renderItem={(context) => (
              <ContextCard
                context={context}
                key={context.id}
                onClick={() => onClick?.(context)}
                onDelete={onDelete}
                onEdit={onEdit}
              />
            )}
          />
        )}
      />
    );
  },
);

export default ContextTimelineView;
