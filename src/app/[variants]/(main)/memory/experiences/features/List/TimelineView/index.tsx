'use client';

import { memo } from 'react';

import { DisplayExperienceMemory } from '@/database/repositories/userMemory';

import { TimelineView as GenericTimelineView } from '../../../../features/TimeLineView';
import { PeriodHeader, TimelineItemWrapper } from '../../../../features/TimeLineView/PeriodGroup';
import ExperienceCard from './ExperienceCard';

interface ExperienceTimelineViewProps {
  experiences: DisplayExperienceMemory[];
  onCardClick: (experience: DisplayExperienceMemory) => void;
  onDelete?: (id: string) => void;
  onEdit?: (id: string) => void;
}

const ExperienceTimelineView = memo<ExperienceTimelineViewProps>(
  ({ experiences, onCardClick, onDelete, onEdit }) => {
    return (
      <GenericTimelineView
        data={experiences}
        groupBy="day"
        renderHeader={(periodKey, itemCount) => (
          <PeriodHeader groupBy="day" itemCount={itemCount} periodKey={periodKey} />
        )}
        renderItem={(experience) => (
          <TimelineItemWrapper>
            <ExperienceCard
              experience={experience}
              onClick={onCardClick}
              onDelete={onDelete}
              onEdit={onEdit}
            />
          </TimelineItemWrapper>
        )}
      />
    );
  },
);

export default ExperienceTimelineView;
