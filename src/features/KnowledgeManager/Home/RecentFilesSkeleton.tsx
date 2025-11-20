'use client';

import { Skeleton } from 'antd';
import { createStyles } from 'antd-style';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

const useStyles = createStyles(({ css, token }) => ({
  card: css`
    flex-shrink: 0;

    width: 280px;
    padding: 12px;
    border: 1px solid ${token.colorBorderSecondary};
    border-radius: ${token.borderRadiusLG}px;

    background: ${token.colorBgContainer};
  `,
  container: css`
    position: relative;
    overflow: hidden;
  `,
  fadeEdge: css`
    pointer-events: none;

    position: absolute;
    inset-block: 0 0;
    inset-inline-end: 0;

    width: 80px;

    background: linear-gradient(to left, ${token.colorBgLayout}, transparent);
  `,
  previewSkeleton: css`
    width: 100%;
    height: 160px;
    margin-block-end: 12px;
    border-radius: ${token.borderRadius}px;

    background: ${token.colorFillQuaternary};
  `,
  scrollContainer: css`
    /* Hide scrollbar */
    scrollbar-width: none;

    overflow-x: auto;
    display: flex;
    gap: 16px;

    padding-block-end: 8px;

    -ms-overflow-style: none;

    &::-webkit-scrollbar {
      display: none;
    }
  `,
}));

const RecentFilesSkeleton = memo(() => {
  const { styles } = useStyles();

  return (
    <div className={styles.container}>
      <div className={styles.scrollContainer}>
        {Array.from({ length: 10 }).map((_, index) => (
          <Flexbox className={styles.card} gap={12} key={index}>
            <div className={styles.previewSkeleton} />
            <Flexbox gap={6}>
              <Skeleton active paragraph={false} title={{ width: '90%' }} />
              <Skeleton active paragraph={false} title={{ style: { height: 12 }, width: '70%' }} />
            </Flexbox>
          </Flexbox>
        ))}
      </div>
      <div className={styles.fadeEdge} />
    </div>
  );
});

export default RecentFilesSkeleton;
