'use client';

import { Flexbox, Skeleton } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { memo } from 'react';

const useStyles = createStyles(({ css, token }) => ({
  container: css`
    display: flex;
    gap: 8px;
    align-items: center;
    justify-content: space-between;

    padding-block: 8px;
    padding-inline: 12px;
    border-radius: ${token.borderRadius}px;
  `,
  leftContent: css`
    overflow: hidden;
    display: flex;
    flex: 1;
    gap: 8px;
    align-items: center;
  `,
}));

export const Placeholder = memo(() => {
  const { styles } = useStyles();

  return (
    <Flexbox className={styles.container} horizontal>
      <Flexbox className={styles.leftContent} horizontal>
        <Skeleton.Avatar
          active
          shape="square"
          size={24}
          style={{ borderRadius: 6, flex: 'none' }}
        />
        <Skeleton.Button
          active
          size={'small'}
          style={{
            height: 20,
            width: 100,
          }}
        />
      </Flexbox>
      <Skeleton.Button
        active
        size={'small'}
        style={{
          borderRadius: '50%',
          height: 8,
          width: 8,
        }}
      />
    </Flexbox>
  );
});

export const SkeletonList = memo(() => (
  <Flexbox gap={4} paddingBlock={8}>
    {Array.from({ length: 6 }).map((_, i) => (
      <Placeholder key={i} />
    ))}
  </Flexbox>
));

export default SkeletonList;
