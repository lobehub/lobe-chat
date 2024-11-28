'use client';

import { Skeleton } from 'antd';
import { createStyles } from 'antd-style';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

const useStyles = createStyles(({ css, prefixCls }) => ({
  avatar: css`
    border-radius: 6px;
  `,
  container: css`
    display: flex;
    align-items: center;
    justify-content: center;

    height: 40px;
    padding-block: 8px;
    padding-inline: 12px;

    .${prefixCls}-skeleton-content {
      display: flex;
      flex-direction: column;
    }
  `,
  paragraph: css`
    > li {
      height: 20px !important;
    }
  `,
}));

export const Placeholder = memo(() => {
  const { styles } = useStyles();

  return (
    <Skeleton
      active
      avatar={{ className: styles.avatar, shape: 'square', size: 'small' }}
      className={styles.container}
      paragraph={{
        className: styles.paragraph,
        rows: 1,
        style: { marginBottom: 0 },
        width: '95%',
      }}
      title={false}
    />
  );
});

export const SkeletonList = memo(() => (
  <Flexbox gap={4} style={{ paddingTop: 6 }}>
    {Array.from({ length: 6 }).map((_, i) => (
      <Placeholder key={i} />
    ))}
  </Flexbox>
));

export default SkeletonList;
