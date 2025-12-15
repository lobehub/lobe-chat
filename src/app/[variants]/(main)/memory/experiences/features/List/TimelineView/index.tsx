'use client';

import { memo } from 'react';

import { DisplayExperienceMemory } from '@/database/repositories/userMemory';
import { useUserMemoryStore } from '@/store/userMemory';

import { TimelineView as GenericTimelineView } from '../../../../features/TimeLineView';
import { PeriodHeader, TimelineItemWrapper } from '../../../../features/TimeLineView/PeriodGroup';
import ExperienceCard from './ExperienceCard';

interface ExperienceTimelineViewProps {
  experiences: DisplayExperienceMemory[];
  isLoading?: boolean;
  onCardClick: (experience: DisplayExperienceMemory) => void;
  onDelete?: (id: string) => void;
  onEdit?: (id: string) => void;
}

const ExperienceTimelineView = memo<ExperienceTimelineViewProps>(
  ({ experiences, isLoading, onCardClick, onDelete, onEdit }) => {
    const loadMoreExperiences = useUserMemoryStore((s) => s.loadMoreExperiences);
    const experiencesHasMore = useUserMemoryStore((s) => s.experiencesHasMore);

    return (
      <GenericTimelineView
        data={experiences}
        groupBy="day"
        hasMore={experiencesHasMore}
        isLoading={isLoading}
        onLoadMore={loadMoreExperiences}
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
