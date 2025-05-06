import { Skeleton } from 'antd';
import { createStyles } from 'antd-style';
import React, { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

const useStyles = createStyles(({ css, token }) => ({
  container: css`
    padding: 8px;
    border: 1px solid ${token.colorBorderSecondary};
    border-radius: ${token.borderRadiusLG}px;
  `,
  header: css`
    margin-block-end: 4px;
  `,
  meta: css`
    font-size: 12px;
  `,
  path: css`
    margin-block-start: 4px;
  `,
}));

const ReadFileSkeleton = memo(() => {
  const { styles } = useStyles();

  return (
    <Flexbox className={styles.container}>
      <Flexbox
        align={'center'}
        className={styles.header}
        gap={24}
        horizontal
        justify={'space-between'}
      >
        <Flexbox align={'center'} flex={1} gap={8} horizontal style={{ overflow: 'hidden' }}>
          <Skeleton.Avatar active shape="square" size={24} style={{ borderRadius: 4 }} />
          <Skeleton.Input active size="small" style={{ flex: 1, minWidth: 100 }} />
        </Flexbox>
        <Flexbox align={'center'} className={styles.meta} gap={16}>
          <Skeleton.Input active size="small" style={{ maxWidth: 40 }} />
        </Flexbox>
      </Flexbox>

      {/* Path */}
      <Skeleton.Input active block className={styles.path} size="small" />
    </Flexbox>
  );
});

export default ReadFileSkeleton;
