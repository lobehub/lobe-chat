'use client';

import { Skeleton } from 'antd';
import { createStyles } from 'antd-style';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

const useStyles = createStyles(({ css, prefixCls }) => ({
  avatar: css`
    width: 32px !important;
    height: 32px !important;
  `,
  container: css`
    display: flex;
    align-items: center;
    justify-content: center;

    height: 56px;
    padding: 12px;

    .${prefixCls}-skeleton-content {
      display: flex;
      flex-direction: column;
    }
  `,
  paragraph: css`
    > li {
      height: 22px !important;
    }
  `,
}));

export const Placeholder = memo(() => {
  const { styles } = useStyles();

  return (
    <Flexbox align={'center'} horizontal justify={'space-between'}>
      <Skeleton
        active
        avatar={{ className: styles.avatar }}
        className={styles.container}
        paragraph={{
          className: styles.paragraph,
          rows: 1,
          style: { marginBottom: 0 },
          width: '40%',
        }}
        title={false}
      />
      <Skeleton.Button active size={'small'} />
    </Flexbox>
  );
});

export const SkeletonList = memo(() => (
  <Flexbox gap={4} style={{ paddingTop: 26 }}>
    {Array.from({ length: 6 }).map((_, i) => (
      <Placeholder key={i} />
    ))}
  </Flexbox>
));

export default SkeletonList;
