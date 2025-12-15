import { memo } from 'react';

import { DisplayPreferenceMemory } from '@/database/repositories/userMemory';
import { useUserMemoryStore } from '@/store/userMemory';

import { GridView } from '../../../../features/GridView';
import PreferenceCard from './PreferenceCard';

interface MasonryViewProps {
  isLoading?: boolean;
  onClick: (preference: DisplayPreferenceMemory) => void;
  onDelete?: (id: string) => void;
  onEdit?: (id: string) => void;
  preferences: DisplayPreferenceMemory[];
}

const MasonryView = memo<MasonryViewProps>(
  ({ preferences, isLoading, onClick, onDelete, onEdit }) => {
    const loadMorePreferences = useUserMemoryStore((s) => s.loadMorePreferences);
    const preferencesHasMore = useUserMemoryStore((s) => s.preferencesHasMore);

    return (
      <GridView
        hasMore={preferencesHasMore}
        isLoading={isLoading}
        items={preferences}
        onLoadMore={loadMorePreferences}
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
  },
);

export default MasonryView;
