'use client';

import { Skeleton } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

const useStyles = createStyles(({ css, prefixCls }) => ({
  container: css`
    display: flex;
    flex-direction: column;
    justify-content: center;

    height: 32px;
    padding-block: 4px;
    padding-inline: 8px;

    .${prefixCls}-skeleton-content {
      display: flex;
      flex-direction: column;
    }
  `,

  paragraph: css`
    > li {
      height: 16px !important;
    }
  `,
}));

const TreeSkeletonItem = memo(() => {
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
        width: '60%',
      }}
      title={false}
    />
  );
});

TreeSkeletonItem.displayName = 'TreeSkeletonItem';

const TreeSkeleton = memo(() => (
  <Flexbox gap={2}>
    {Array.from({ length: 5 }).map((_, i) => (
      <TreeSkeletonItem key={i} />
    ))}
  </Flexbox>
));

TreeSkeleton.displayName = 'TreeSkeleton';

export default TreeSkeleton;
