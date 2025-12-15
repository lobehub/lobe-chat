import { memo } from 'react';

import { useUserMemoryStore } from '@/store/userMemory';
import type { UserMemoryIdentity } from '@/types/index';

import { GridView } from '../../../../features/GridView';
import IdentityCard from './IdentityCard';

interface MasonryViewProps {
  identities: UserMemoryIdentity[];
  onClick?: (identity: UserMemoryIdentity) => void;
  onDelete?: (id: string) => void;
}

const MasonryView = memo<MasonryViewProps>(({ identities, onClick, onDelete }) => {
  const loadMoreIdentities = useUserMemoryStore((s) => s.loadMoreIdentities);
  const identitiesHasMore = useUserMemoryStore((s) => s.identitiesHasMore);
  const identitiesIsLoading = useUserMemoryStore((s) => s.identitiesIsLoading);

  return (
    <GridView
      defaultColumnCount={3}
      hasMore={identitiesHasMore}
      isLoading={identitiesIsLoading}
      items={identities}
      maxItemWidth={360}
      onLoadMore={loadMoreIdentities}
      renderItem={(identity) => (
        <IdentityCard identity={identity} onClick={() => onClick?.(identity)} onDelete={onDelete} />
      )}
    />
  );
});

export default MasonryView;
