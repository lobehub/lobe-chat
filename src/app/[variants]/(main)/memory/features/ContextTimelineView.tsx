'use client';

import { createStyles } from 'antd-style';
import dayjs from 'dayjs';
import { memo, useMemo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { DisplayContextMemory } from '@/database/repositories/userMemory';

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
  contexts: DisplayContextMemory[];
  onClick?: (context: DisplayContextMemory) => void;
  onDelete?: (id: string) => void;
  onEdit?: (id: string) => void;
}

const ContextTimelineView = memo<ContextTimelineViewProps>(
  ({ contexts, onClick, onDelete, onEdit }) => {
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
        {} as Record<string, DisplayContextMemory[]>,
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
              onDelete={onDelete}
              onEdit={onEdit}
            />
          ))}
        </Flexbox>
      </div>
    );
  },
);

export default ContextTimelineView;
