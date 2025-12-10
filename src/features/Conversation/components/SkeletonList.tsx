'use client';

import { Skeleton } from 'antd';
import { createStyles } from 'antd-style';
import { memo } from 'react';

import WideScreenContainer from '../../WideScreenContainer';

const useStyles = createStyles(({ css, prefixCls }) => ({
  message: css`
    display: flex;
    gap: 12px;
    .${prefixCls}-skeleton-header {
      padding: 0;
    }
  `,
  user: css`
    flex-direction: row-reverse;

    .${prefixCls}-skeleton-paragraph {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
    }
  `,
}));

const SkeletonList = memo(() => {
  const { cx, styles } = useStyles();

  return (
    <WideScreenContainer flex={1} gap={24} height={'100%'} padding={12} style={{ marginTop: 24 }}>
      <Skeleton
        active
        className={cx(styles.message, styles.user)}
        paragraph={{ width: ['50%', '30%'] }}
        title={false}
      />
      <Skeleton
        active
        className={styles.message}
        paragraph={{ width: ['50%', '30%'] }}
        title={false}
      />
    </WideScreenContainer>
  );
});

export default SkeletonList;
