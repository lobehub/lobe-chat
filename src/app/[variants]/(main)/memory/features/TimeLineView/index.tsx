'use client';

import { createStyles } from 'antd-style';
import dayjs from 'dayjs';
import { Fragment, ReactNode, memo, useMemo } from 'react';
import { Flexbox } from 'react-layout-kit';

const useStyles = createStyles(({ css, token }) => ({
  timelineLine: css`
    position: absolute;
    inset-block: 0;
    inset-inline-start: 8px;

    width: 1px;
    height: 100%;

    background: ${token.colorBorder};
  `,
}));

export type GroupBy = 'day' | 'month';

interface TimelineViewProps<T extends { createdAt: Date | string }> {
  data: T[];
  /**
   * Custom date field extractor for grouping
   * Used when the date to group by is not `createdAt`
   */
  getDateForGrouping?: (item: T) => Date | string;
  /**
   * Group items by 'day' (YYYY-MM-DD) or 'month' (YYYY-MM)
   * @default 'day'
   */
  groupBy?: GroupBy;
  renderGroup: (periodKey: string, items: T[]) => ReactNode;
}

function TimelineViewInner<T extends { createdAt: Date | string }>({
  data,
  groupBy = 'day',
  getDateForGrouping,
  renderGroup,
}: TimelineViewProps<T>) {
  const { styles } = useStyles();

  const groupedByPeriod = useMemo(() => {
    const format = groupBy === 'month' ? 'YYYY-MM' : 'YYYY-MM-DD';

    return data.reduce(
      (acc, item) => {
        const dateValue = getDateForGrouping ? getDateForGrouping(item) : item.createdAt;
        const date = dayjs(dateValue);
        const periodKey = date.format(format);

        if (!acc[periodKey]) {
          acc[periodKey] = [];
        }
        acc[periodKey].push(item);
        return acc;
      },
      {} as Record<string, T[]>,
    );
  }, [data, groupBy, getDateForGrouping]);

  const sortedPeriods = useMemo(() => {
    return Object.keys(groupedByPeriod).sort((a, b) => b.localeCompare(a));
  }, [groupedByPeriod]);

  return (
    <div style={{ position: 'relative' }}>
      <div className={styles.timelineLine} />
      <Flexbox gap={32}>
        {sortedPeriods.map((periodKey) => (
          <Fragment key={periodKey}>{renderGroup(periodKey, groupedByPeriod[periodKey])}</Fragment>
        ))}
      </Flexbox>
    </div>
  );
}

export const TimelineView = memo(TimelineViewInner) as typeof TimelineViewInner;
