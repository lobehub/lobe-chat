'use client';

import { createStyles } from 'antd-style';
import dayjs from 'dayjs';
import { memo, useMemo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { UserMemoryContextsWithoutVectors } from '@/database/schemas';

import ContextDayGroup from './ContextDayGroup';

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

interface ContextTimelineViewProps {
  contexts: UserMemoryContextsWithoutVectors[];
  onClick?: (context: UserMemoryContextsWithoutVectors) => void;
}

const ContextTimelineView = memo<ContextTimelineViewProps>(({ contexts, onClick }) => {
  const { styles } = useStyles();

  const groupedByDay = useMemo(() => {
    return contexts.reduce(
      (acc, context) => {
        const date = dayjs(context.createdAt);
        const dayKey = date.format('YYYY-MM-DD');

        if (!acc[dayKey]) {
          acc[dayKey] = [];
        }
        acc[dayKey].push(context);
        return acc;
      },
      {} as Record<string, UserMemoryContextsWithoutVectors[]>,
    );
  }, [contexts]);

  const sortedDays = useMemo(() => {
    return Object.keys(groupedByDay).sort((a, b) => b.localeCompare(a));
  }, [groupedByDay]);

  return (
    <div className={styles.timelineContainer}>
      <div className={styles.timelineLine} />

      <Flexbox gap={32}>
        {sortedDays.map((dayKey) => (
          <ContextDayGroup
            contexts={groupedByDay[dayKey]}
            dayKey={dayKey}
            key={dayKey}
            onClick={onClick}
          />
        ))}
      </Flexbox>
    </div>
  );
});

export default ContextTimelineView;
