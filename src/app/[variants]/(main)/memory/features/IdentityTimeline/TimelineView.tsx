import type { UserMemoryIdentity } from '@lobechat/types';
import { createStyles } from 'antd-style';
import dayjs from 'dayjs';
import { memo, useMemo } from 'react';
import { Flexbox } from 'react-layout-kit';

import MonthGroup from './MonthGroup';

const useStyles = createStyles(({ css, token }) => ({
  timelineContainer: css`
    position: relative;
    padding-inline-start: 24px;
  `,
  timelineLine: css`
    position: absolute;
    inset-block: 20px;
    inset-inline-start: -4px;

    width: 1px;

    background: ${token.colorBorderSecondary};
  `,
}));

interface TimelineViewProps {
  identities: UserMemoryIdentity[];
}

const TimelineView = memo<TimelineViewProps>(({ identities }) => {
  const { styles } = useStyles();

  const groupedByMonth = useMemo(() => {
    return identities.reduce(
      (acc, identity) => {
        const date = identity.episodicDate
          ? dayjs(identity.episodicDate)
          : dayjs(identity.createdAt);
        const monthKey = date.format('YYYY-MM');

        if (!acc[monthKey]) {
          acc[monthKey] = [];
        }
        acc[monthKey].push(identity);
        return acc;
      },
      {} as Record<string, UserMemoryIdentity[]>,
    );
  }, [identities]);

  const sortedMonths = useMemo(() => {
    return Object.keys(groupedByMonth).sort((a, b) => b.localeCompare(a));
  }, [groupedByMonth]);

  return (
    <div className={styles.timelineContainer}>
      <div className={styles.timelineLine} />

      <Flexbox gap={32}>
        {sortedMonths.map((monthKey) => (
          <MonthGroup identities={groupedByMonth[monthKey]} key={monthKey} monthKey={monthKey} />
        ))}
      </Flexbox>
    </div>
  );
});

export default TimelineView;
