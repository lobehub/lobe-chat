import { memo } from 'react';

import { DisplayPreferenceMemory } from '@/database/repositories/userMemory';

import { MasonryView as GenericMasonryView } from '../../../../features/MasonryView';
import PreferenceCard from './PreferenceCard';

interface MasonryViewProps {
  onClick: (preference: DisplayPreferenceMemory) => void;
  onDelete?: (id: string) => void;
  onEdit?: (id: string) => void;
  preferences: DisplayPreferenceMemory[];
}

const MasonryView = memo<MasonryViewProps>(({ preferences, onClick, onDelete, onEdit }) => {
  return (
    <GenericMasonryView
      defaultColumnCount={4}
      items={preferences}
      renderItem={(preference, actions) => (
        <PreferenceCard
          onClick={() => onClick(preference)}
          onDelete={actions.onDelete || onDelete}
          onEdit={actions.onEdit || onEdit}
          preference={preference}
        />
      )}
    />
  );
});

export default MasonryView;
