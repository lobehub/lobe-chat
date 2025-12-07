'use client';

import { createStyles } from 'antd-style';
import dayjs from 'dayjs';
import { memo } from 'react';
import { Center, Flexbox } from 'react-layout-kit';

import { DisplayContextMemory } from '@/database/repositories/userMemory';

import ContextCard from '../MasonryView/ContextCard';

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

interface ContextDayGroupProps {
  contexts: DisplayContextMemory[];
  dayKey: string;
  onClick?: (context: DisplayContextMemory) => void;
  onDelete?: (id: string) => void;
  onEdit?: (id: string) => void;
}

const ContextDayGroup = memo<ContextDayGroupProps>(
  ({ contexts, dayKey, onClick, onDelete, onEdit }) => {
    const { styles } = useStyles();

    const dayName = dayjs(dayKey).format('YYYY年MM月DD日');

    const sortedContexts = [...contexts].sort((a, b) => {
      return dayjs(b.createdAt).valueOf() - dayjs(a.createdAt).valueOf();
    });

    return (
      <Flexbox gap={12}>
        <Flexbox align={'center'} className={styles.dayHeader} horizontal>
          {dayName}
          <Center className={styles.count}>{contexts.length}</Center>
        </Flexbox>

        <Flexbox gap={8}>
          {sortedContexts.map((context) => (
            <ContextCard
              context={context}
              key={context.id}
              onClick={() => onClick?.(context)}
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

export default ContextDayGroup;
