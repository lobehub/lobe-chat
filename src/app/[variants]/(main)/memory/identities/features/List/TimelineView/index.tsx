import { memo } from 'react';

import { useUserMemoryStore } from '@/store/userMemory';
import type { UserMemoryIdentity } from '@/types/index';

import { TimelineView as GenericTimelineView } from '../../../../features/TimeLineView';
import { PeriodHeader, TimelineItemWrapper } from '../../../../features/TimeLineView/PeriodGroup';
import IdentityCard from './IdentityCard';

interface TimelineViewProps {
  identities: UserMemoryIdentity[];
  isLoading?: boolean;
  onClick?: (identity: UserMemoryIdentity) => void;
  onDelete?: (id: string) => void;
}

const TimelineView = memo<TimelineViewProps>(({ identities, isLoading, onClick, onDelete }) => {
  const loadMoreIdentities = useUserMemoryStore((s) => s.loadMoreIdentities);
  const identitiesHasMore = useUserMemoryStore((s) => s.identitiesHasMore);

  return (
    <GenericTimelineView
      data={identities}
      getDateForGrouping={(identity) => identity.episodicDate || identity.createdAt}
      groupBy="month"
      hasMore={identitiesHasMore}
      isLoading={isLoading}
      onLoadMore={loadMoreIdentities}
      renderHeader={(periodKey, itemCount) => (
        <PeriodHeader groupBy="month" itemCount={itemCount} periodKey={periodKey} />
      )}
      renderItem={(identity) => (
        <TimelineItemWrapper>
          <IdentityCard
            identity={identity}
            onClick={() => onClick?.(identity)}
            onDelete={onDelete}
          />
        </TimelineItemWrapper>
      )}
    />
  );
});

export default TimelineView;
