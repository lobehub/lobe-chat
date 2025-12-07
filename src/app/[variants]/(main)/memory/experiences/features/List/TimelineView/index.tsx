'use client';

import { memo } from 'react';

import { DisplayExperienceMemory } from '@/database/repositories/userMemory';

import { TimelineView as GenericTimelineView } from '../../../../features/TimeLineView';
import { PeriodGroup } from '../../../../features/TimeLineView/PeriodGroup';
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
        renderGroup={(periodKey, items) => (
          <PeriodGroup
            groupBy="day"
            items={items}
            periodKey={periodKey}
            renderItem={(experience) => (
              <ExperienceCard
                experience={experience}
                key={experience.id}
                onClick={onCardClick}
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

export default ExperienceTimelineView;
