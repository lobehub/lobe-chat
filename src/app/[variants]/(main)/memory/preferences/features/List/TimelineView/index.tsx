'use client';

import { memo } from 'react';

import { DisplayPreferenceMemory } from '@/database/repositories/userMemory';

import { TimelineView as GenericTimelineView } from '../../../../features/TimeLineView';
import { PeriodHeader, TimelineItemWrapper } from '../../../../features/TimeLineView/PeriodGroup';
import PreferenceCard from './PreferenceCard';

interface PreferenceTimelineViewProps {
  onClick?: (preference: DisplayPreferenceMemory) => void;
  onDelete?: (id: string) => void;
  onEdit?: (id: string) => void;
  preferences: DisplayPreferenceMemory[];
}

const PreferenceTimelineView = memo<PreferenceTimelineViewProps>(
  ({ preferences, onClick, onDelete, onEdit }) => {
    return (
      <GenericTimelineView
        data={preferences}
        groupBy="day"
        renderHeader={(periodKey, itemCount) => (
          <PeriodHeader groupBy="day" itemCount={itemCount} periodKey={periodKey} />
        )}
        renderItem={(preference) => (
          <TimelineItemWrapper>
            <PreferenceCard
              onClick={() => onClick?.(preference)}
              onDelete={onDelete}
              onEdit={onEdit}
              preference={preference}
            />
          </TimelineItemWrapper>
        )}
      />
    );
  },
);

export default PreferenceTimelineView;
