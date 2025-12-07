'use client';

import { Tag, Text } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import dayjs from 'dayjs';
import { ReactNode, memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { GroupBy } from './index';

const useStyles = createStyles(({ css, token }) => ({
  itemWrapper: css`
    position: relative;
    padding-inline-start: 24px;
  `,
  periodHeader: css`
    position: sticky;
    z-index: 3;
    inset-block-start: 0;
    background: ${token.colorBgContainer};
  `,
  timelineDot: css`
    position: absolute;
    z-index: 2;
    inset-block-start: 18px;
    inset-inline-start: 0;

    width: 16px;
    height: 16px;
    border: 1px solid ${token.colorBorderSecondary};
    border-radius: 50%;

    background: ${token.colorBgContainer};
    box-shadow: 0 2px 4px -2px rgba(0, 0, 0, 40%);
  `,
}));

interface PeriodGroupProps<T extends { createdAt: Date | string; id: string }> {
  /**
   * Custom date field extractor for sorting
   */
  getDateForSorting?: (item: T) => Date | string;
  groupBy?: GroupBy;
  items: T[];
  periodKey: string;
  renderItem: (item: T) => ReactNode;
}

function PeriodGroupInner<T extends { createdAt: Date | string; id: string }>({
  periodKey,
  items,
  groupBy = 'day',
  getDateForSorting,
  renderItem,
}: PeriodGroupProps<T>) {
  const { styles } = useStyles();

  const periodName =
    groupBy === 'month'
      ? dayjs(`${periodKey}-01`).format('YYYY年MM月')
      : dayjs(periodKey).format('YYYY年MM月DD日');

  const sortedItems = [...items].sort((a, b) => {
    const dateA = getDateForSorting ? getDateForSorting(a) : a.createdAt;
    const dateB = getDateForSorting ? getDateForSorting(b) : b.createdAt;
    return dayjs(dateB).valueOf() - dayjs(dateA).valueOf();
  });

  return (
    <Flexbox gap={12}>
      <Flexbox
        align={'center'}
        className={styles.periodHeader}
        gap={8}
        horizontal
        paddingBlock={12}
      >
        <Text weight={500}>{periodName}</Text>
        <Tag>{items.length}</Tag>
      </Flexbox>
      <Flexbox gap={8}>
        {sortedItems.map((item) => (
          <div className={styles.itemWrapper} key={item.id}>
            <div className={styles.timelineDot} />
            {renderItem(item)}
          </div>
        ))}
      </Flexbox>
    </Flexbox>
  );
}

export const PeriodGroup = memo(PeriodGroupInner) as typeof PeriodGroupInner;
