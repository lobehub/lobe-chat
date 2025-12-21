import { Flexbox, Skeleton } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import React, { memo } from 'react';

const useStyles = createStyles(({ css, token }) => ({
  container: css`
    padding: 8px;
    border: 1px solid ${token.colorBorderSecondary};
    border-radius: ${token.borderRadiusLG}px;
  `,

  meta: css`
    font-size: 12px;
  `,
}));

const ReadFileSkeleton = memo(() => {
  const { styles } = useStyles();

  return (
    <Flexbox className={styles.container} gap={2}>
      <Flexbox align={'center'} gap={24} horizontal justify={'space-between'}>
        <Flexbox align={'center'} flex={1} gap={8} horizontal style={{ overflow: 'hidden' }}>
          <Skeleton.Block active style={{ flex: 1, height: 16, width: 20 }} />

          <Skeleton.Block active style={{ flex: 1, height: 16, minWidth: 100 }} />
        </Flexbox>
        <Flexbox align={'center'} className={styles.meta} gap={16}>
          <Skeleton.Block active style={{ height: 16, maxWidth: 40 }} />
        </Flexbox>
      </Flexbox>

      {/* Path */}
      <Skeleton.Block active style={{ height: 16, width: '100%' }} />
    </Flexbox>
  );
});

export default ReadFileSkeleton;
