'use client';

import { Skeleton } from 'antd';
import { createStyles } from 'antd-style';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

const useStyles = createStyles(({ css, token }) => ({
  card: css`
    padding: 20px;
    border: 1px solid ${token.colorBorderSecondary};
    border-radius: ${token.borderRadiusLG}px;
    background: ${token.colorBgContainer};
  `,
  grid: css`
    display: grid;
    grid-template-columns: repeat(1, 1fr);
    gap: 16px;

    @media (width >= 640px) {
      grid-template-columns: repeat(2, 1fr);
    }

    @media (width >= 900px) {
      grid-template-columns: repeat(3, 1fr);
    }
  `,
}));

const RecentFilesSkeleton = memo(() => {
  const { styles } = useStyles();

  return (
    <Flexbox className={styles.grid}>
      {Array.from({ length: 6 }).map((_, index) => (
        <Flexbox className={styles.card} gap={12} horizontal key={index}>
          <Skeleton.Avatar active shape="square" size={48} />
          <Flexbox flex={1} gap={8}>
            <Skeleton active paragraph={false} title={{ width: '80%' }} />
            <Skeleton active paragraph={false} title={{ style: { height: 12 }, width: '60%' }} />
          </Flexbox>
        </Flexbox>
      ))}
    </Flexbox>
  );
});

export default RecentFilesSkeleton;

