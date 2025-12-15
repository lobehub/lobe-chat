import { memo } from 'react';

import { useUserMemoryStore } from '@/store/userMemory';
import type { UserMemoryIdentity } from '@/types/index';

import { GridView } from '../../../../features/GridView';
import IdentityCard from './IdentityCard';

interface MasonryViewProps {
  identities: UserMemoryIdentity[];
  isLoading?: boolean;
  onClick?: (identity: UserMemoryIdentity) => void;
  onDelete?: (id: string) => void;
}

const MasonryView = memo<MasonryViewProps>(({ identities, isLoading, onClick, onDelete }) => {
  const loadMoreIdentities = useUserMemoryStore((s) => s.loadMoreIdentities);
  const identitiesHasMore = useUserMemoryStore((s) => s.identitiesHasMore);

  return (
    <GridView
      hasMore={identitiesHasMore}
      isLoading={isLoading}
      items={identities}
      onLoadMore={loadMoreIdentities}
      renderItem={(identity) => (
        <IdentityCard identity={identity} onClick={() => onClick?.(identity)} onDelete={onDelete} />
      )}
    />
  );
});

export default MasonryView;
