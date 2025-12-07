'use client';

import { createStyles } from 'antd-style';
import dayjs from 'dayjs';
import { memo } from 'react';
import { Center, Flexbox } from 'react-layout-kit';

import { DisplayPreferenceMemory } from '@/database/repositories/userMemory';

import PreferenceCard from '../MasonryView/PreferenceCard';

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

interface PreferenceDayGroupProps {
  dayKey: string;
  onClick?: (preference: DisplayPreferenceMemory) => void;
  onDelete?: (id: string) => void;
  onEdit?: (id: string) => void;
  preferences: DisplayPreferenceMemory[];
}

const PreferenceDayGroup = memo<PreferenceDayGroupProps>(
  ({ preferences, dayKey, onClick, onDelete, onEdit }) => {
    const { styles } = useStyles();

    const dayName = dayjs(dayKey).format('YYYY年MM月DD日');

    const sortedPreferences = [...preferences].sort((a, b) => {
      return dayjs(b.createdAt).valueOf() - dayjs(a.createdAt).valueOf();
    });

    return (
      <Flexbox gap={12}>
        <Flexbox align={'center'} className={styles.dayHeader} horizontal>
          {dayName}
          <Center className={styles.count}>{preferences.length}</Center>
        </Flexbox>

        <Flexbox gap={8}>
          {sortedPreferences.map((preference) => (
            <PreferenceCard
              key={preference.id}
              onClick={() => onClick?.(preference)}
              onDelete={onDelete}
              onEdit={onEdit}
              preference={preference}
              showTimeline
            />
          ))}
        </Flexbox>
      </Flexbox>
    );
  },
);

export default PreferenceDayGroup;
