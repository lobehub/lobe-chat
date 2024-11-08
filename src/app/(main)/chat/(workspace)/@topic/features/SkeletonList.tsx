'use client';

import { Skeleton } from 'antd';
import { createStyles } from 'antd-style';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

const useStyles = createStyles(({ css, prefixCls }) => ({
  container: css`
    display: flex;
    flex-direction: column;
    justify-content: center;

    height: 44px;
    padding: 8px;

    .${prefixCls}-skeleton-content {
      display: flex;
      flex-direction: column;
    }
  `,

  paragraph: css`
    > li {
      height: 24px !important;
    }
  `,
}));

export const Placeholder = memo(() => {
  const { styles } = useStyles();

  return (
    <Skeleton
      active
      avatar={false}
      className={styles.container}
      paragraph={{
        className: styles.paragraph,
        rows: 1,
        style: { marginBottom: 0 },
        width: '100%',
      }}
      title={false}
    />
  );
});

export const SkeletonList = memo(() => (
  <Flexbox style={{ paddingTop: 6 }}>
    {Array.from({ length: 8 }).map((_, i) => (
      <Placeholder key={i} />
    ))}
  </Flexbox>
));

export default SkeletonList;
