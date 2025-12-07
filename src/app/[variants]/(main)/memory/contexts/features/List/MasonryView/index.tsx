import { memo } from 'react';

import { DisplayContextMemory } from '@/database/repositories/userMemory';

import { MasonryView as GenericMasonryView } from '../../../../features/MasonryView';
import ContextCard from './ContextCard';

interface MasonryViewProps {
  contexts: DisplayContextMemory[];
  onClick: (context: DisplayContextMemory) => void;
  onDelete?: (id: string) => void;
  onEdit?: (id: string) => void;
}

const MasonryView = memo<MasonryViewProps>(({ contexts, onClick, onDelete, onEdit }) => {
  return (
    <GenericMasonryView
      defaultColumnCount={2}
      items={contexts}
      renderItem={(context, actions) => (
        <ContextCard
          context={context}
          onClick={() => onClick(context)}
          onDelete={actions.onDelete || onDelete}
          onEdit={actions.onEdit || onEdit}
        />
      )}
    />
  );
});

export default MasonryView;
