'use client';

import { createStyles } from 'antd-style';
import dayjs from 'dayjs';
import { memo } from 'react';
import { Center, Flexbox } from 'react-layout-kit';

import { DisplayExperienceMemory } from '@/database/repositories/userMemory';

import ExperienceCard from '../MasonryView/ExperienceCard';

const useStyles = createStyles(({ css, token }) => ({
  count: css`
    width: 18px;
    height: 18px;
    margin-inline-start: 8px;
    border-radius: 8px;

    font-size: 11px;
    font-weight: 400;
    line-height: 16px;
    color: ${token.colorTextTertiary};

    background: ${token.colorFillTertiary};
  `,
  dayHeader: css`
    margin-block-end: 16px;
    margin-inline-start: -16px;

    font-size: 12px;
    font-weight: 500;
    color: ${token.colorTextSecondary};
  `,
}));

interface ExperienceDayGroupProps {
  dayKey: string;
  experiences: DisplayExperienceMemory[];
  onCardClick: (experience: DisplayExperienceMemory) => void;
  onDelete?: (id: string) => void;
  onEdit?: (id: string) => void;
}

const ExperienceDayGroup = memo<ExperienceDayGroupProps>(
  ({ experiences, dayKey, onCardClick, onDelete, onEdit }) => {
    const { styles } = useStyles();

    const dayName = dayjs(dayKey).format('YYYY年MM月DD日');

    const sortedExperiences = [...experiences].sort((a, b) => {
      return dayjs(b.createdAt).valueOf() - dayjs(a.createdAt).valueOf();
    });

    return (
      <Flexbox gap={12}>
        <Flexbox align={'center'} className={styles.dayHeader} horizontal>
          {dayName}
          <Center className={styles.count}>{experiences.length}</Center>
        </Flexbox>

        <Flexbox gap={8}>
          {sortedExperiences.map((experience) => (
            <ExperienceCard
              experience={experience}
              key={experience.id}
              onClick={() => onCardClick(experience)}
              onDelete={onDelete}
              onEdit={onEdit}
              showTimeline
            />
          ))}
        </Flexbox>
      </Flexbox>
    );
  },
);

export default ExperienceDayGroup;
