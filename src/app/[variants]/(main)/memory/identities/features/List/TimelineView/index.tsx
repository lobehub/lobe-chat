import { memo } from 'react';

import { PeriodGroup } from '@/app/[variants]/(main)/memory/features/TimeLineView/PeriodGroup';
import type { UserMemoryIdentity } from '@/types/index';

import { TimelineView as GenericTimelineView } from '../../../../features/TimeLineView';
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
      renderGroup={(periodKey, items) => (
        <PeriodGroup
          getDateForSorting={(identity) => identity.episodicDate || identity.createdAt}
          groupBy="month"
          items={items}
          periodKey={periodKey}
          renderItem={(identity) => <IdentityCard identity={identity} key={identity.id} />}
        />
      )}
    />
  );
});

export default TimelineView;
