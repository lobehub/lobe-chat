import { memo } from 'react';

import type { UserMemoryIdentity } from '@/types/index';

import { TimelineView as GenericTimelineView } from '../../../../features/TimeLineView';
import { PeriodHeader, TimelineItemWrapper } from '../../../../features/TimeLineView/PeriodGroup';
import IdentityCard from './IdentityCard';

interface TimelineViewProps {
  identities: UserMemoryIdentity[];
}

const TimelineView = memo<TimelineViewProps>(({ identities }) => {
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
          <IdentityCard identity={identity} />
        </TimelineItemWrapper>
      )}
    />
  );
});

export default TimelineView;
