'use client';

import { memo } from 'react';

import { DisplayPreferenceMemory } from '@/database/repositories/userMemory';

import { TimelineView as GenericTimelineView } from '../../../../features/TimeLineView';
import { PeriodGroup } from '../../../../features/TimeLineView/PeriodGroup';
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
        renderGroup={(periodKey, items) => (
          <PeriodGroup
            groupBy="day"
            items={items}
            periodKey={periodKey}
            renderItem={(preference) => (
              <PreferenceCard
                key={preference.id}
                onClick={() => onClick?.(preference)}
                onDelete={onDelete}
                onEdit={onEdit}
                preference={preference}
              />
            )}
          />
        )}
      />
    );
  },
);

export default PreferenceTimelineView;
