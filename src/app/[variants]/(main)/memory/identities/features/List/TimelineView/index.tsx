import { memo } from 'react';

import type { UserMemoryIdentity } from '@/types/index';

import { TimelineView as GenericTimelineView } from '../../../../features/TimeLineView';
import { PeriodHeader, TimelineItemWrapper } from '../../../../features/TimeLineView/PeriodGroup';
import IdentityCard from './IdentityCard';

interface TimelineViewProps {
  identities: UserMemoryIdentity[];
  onDelete?: (id: string) => void;
}

const TimelineView = memo<TimelineViewProps>(({ identities, onDelete }) => {
  return (
    <GenericTimelineView
      data={identities}
      getDateForGrouping={(identity) => identity.episodicDate || identity.createdAt}
      groupBy="month"
      renderHeader={(periodKey, itemCount) => (
        <PeriodHeader groupBy="month" itemCount={itemCount} periodKey={periodKey} />
      )}
      renderItem={(identity) => (
        <TimelineItemWrapper>
          <IdentityCard identity={identity} onDelete={onDelete} />
        </TimelineItemWrapper>
      )}
    />
  );
});

export default TimelineView;
