'use client';

import { createStyles } from 'antd-style';
import dayjs from 'dayjs';
import { memo, useMemo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { DisplayPreferenceMemory } from '@/database/repositories/userMemory';

import PreferenceDayGroup from './DayGroup';

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

interface PreferenceTimelineViewProps {
  onClick?: (preference: DisplayPreferenceMemory) => void;
  onDelete?: (id: string) => void;
  onEdit?: (id: string) => void;
  preferences: DisplayPreferenceMemory[];
}

const PreferenceTimelineView = memo<PreferenceTimelineViewProps>(
  ({ preferences, onClick, onDelete, onEdit }) => {
    const { styles } = useStyles();

    const groupedByDay = useMemo(() => {
      return preferences.reduce(
        (acc, preference) => {
          const date = dayjs(preference.createdAt);
          const dayKey = date.format('YYYY-MM-DD');

          if (!acc[dayKey]) {
            acc[dayKey] = [];
          }
          acc[dayKey].push(preference);
          return acc;
        },
        {} as Record<string, DisplayPreferenceMemory[]>,
      );
    }, [preferences]);

    const sortedDays = useMemo(() => {
      return Object.keys(groupedByDay).sort((a, b) => b.localeCompare(a));
    }, [groupedByDay]);

    return (
      <div className={styles.timelineContainer}>
        <div className={styles.timelineLine} />

        <Flexbox gap={32}>
          {sortedDays.map((dayKey) => (
            <PreferenceDayGroup
              dayKey={dayKey}
              key={dayKey}
              onClick={onClick}
              onDelete={onDelete}
              onEdit={onEdit}
              preferences={groupedByDay[dayKey]}
            />
          ))}
        </Flexbox>
      </div>
    );
  },
);

export default PreferenceTimelineView;
