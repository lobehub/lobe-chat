import { memo } from 'react';

import { DisplayExperienceMemory } from '@/database/repositories/userMemory';

import { MasonryView as GenericMasonryView } from '../../../../features/MasonryView';
import ExperienceCard from './ExperienceCard';

interface MasonryViewProps {
  experiences: DisplayExperienceMemory[];
  onClick: (experience: DisplayExperienceMemory) => void;
  onDelete?: (id: string) => void;
  onEdit?: (id: string) => void;
}

const MasonryView = memo<MasonryViewProps>(({ experiences, onClick, onDelete, onEdit }) => {
  return (
    <GenericMasonryView
      defaultColumnCount={3}
      items={experiences}
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
});

export default MasonryView;
