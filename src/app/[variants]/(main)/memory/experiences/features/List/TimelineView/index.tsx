'use client';

import { createStyles } from 'antd-style';
import dayjs from 'dayjs';
import { memo, useMemo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { DisplayExperienceMemory } from '@/database/repositories/userMemory';

import ExperienceDayGroup from './DayGroup';

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

interface ExperienceTimelineViewProps {
  experiences: DisplayExperienceMemory[];
  onCardClick: (experience: DisplayExperienceMemory) => void;
  onDelete?: (id: string) => void;
  onEdit?: (id: string) => void;
}

const ExperienceTimelineView = memo<ExperienceTimelineViewProps>(
  ({ experiences, onCardClick, onDelete, onEdit }) => {
    const { styles } = useStyles();

    const groupedByDay = useMemo(() => {
      return experiences.reduce(
        (acc, experience) => {
          const date = dayjs(experience.createdAt);
          const dayKey = date.format('YYYY-MM-DD');

          if (!acc[dayKey]) {
            acc[dayKey] = [];
          }
          acc[dayKey].push(experience);
          return acc;
        },
        {} as Record<string, DisplayExperienceMemory[]>,
      );
    }, [experiences]);

    const sortedDays = useMemo(() => {
      return Object.keys(groupedByDay).sort((a, b) => b.localeCompare(a));
    }, [groupedByDay]);

    return (
      <div className={styles.timelineContainer}>
        <div className={styles.timelineLine} />

        <Flexbox gap={32}>
          {sortedDays.map((dayKey) => (
            <ExperienceDayGroup
              dayKey={dayKey}
              experiences={groupedByDay[dayKey]}
              key={dayKey}
              onCardClick={onCardClick}
              onDelete={onDelete}
              onEdit={onEdit}
            />
          ))}
        </Flexbox>
      </div>
    );
  },
);

export default ExperienceTimelineView;
