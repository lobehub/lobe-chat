import { memo } from 'react';

import { DisplayExperienceMemory } from '@/database/repositories/userMemory';
import { useUserMemoryStore } from '@/store/userMemory';

import { GridView } from '../../../../features/GridView';
import ExperienceCard from './ExperienceCard';

interface MasonryViewProps {
  experiences: DisplayExperienceMemory[];
  isLoading?: boolean;
  onClick: (experience: DisplayExperienceMemory) => void;
  onDelete?: (id: string) => void;
  onEdit?: (id: string) => void;
}

const MasonryView = memo<MasonryViewProps>(
  ({ experiences, isLoading, onClick, onDelete, onEdit }) => {
    const loadMoreExperiences = useUserMemoryStore((s) => s.loadMoreExperiences);
    const experiencesHasMore = useUserMemoryStore((s) => s.experiencesHasMore);

    return (
      <GridView
        defaultColumnCount={3}
        hasMore={experiencesHasMore}
        isLoading={isLoading}
        items={experiences}
        maxItemWidth={360}
        onLoadMore={loadMoreExperiences}
        renderItem={(experience, actions) => (
          <ExperienceCard
            experience={experience}
            onClick={() => onClick(experience)}
            onDelete={actions.onDelete || onDelete}
            onEdit={actions.onEdit || onEdit}
          />
        )}
      />
    );
  },
);

export default MasonryView;
