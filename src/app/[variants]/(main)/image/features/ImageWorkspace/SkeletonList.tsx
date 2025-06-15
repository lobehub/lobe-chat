'use client';

import { Skeleton } from 'antd';
import { createStyles } from 'antd-style';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

const useStyles = createStyles(({ css, token }) => ({
  skeletonContainer: css`
    padding: 16px;
    border-radius: ${token.borderRadiusLG}px;
    background: ${token.colorBgContainer};
    border: 1px solid ${token.colorBorderSecondary};
  `,
  imageGrid: css`
    display: flex;
    gap: 8px;
    width: 100%;
    overflow-x: hidden;
  `,
  imageGridItem: css`
    flex-shrink: 0;
    width: 200px;
    height: 200px;
    background: ${token.colorFillContent};
    border-radius: ${token.borderRadius}px;
    overflow: hidden;
    position: relative;
  `,
  skeletonFill: css`
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  `,
}));

const SkeletonList = memo(() => {
  const { styles } = useStyles();

  return (
    <Flexbox gap={16} width="100%">
      {Array.from({ length: 3 }).map((_, index) => (
        <div className={styles.skeletonContainer} key={index}>
          <Flexbox gap={12}>
            {/* Prompt text skeleton */}
            <Skeleton.Button active style={{ width: '95%', height: 20 }} />

            {/* Metadata skeleton */}
            <Flexbox gap={12} horizontal style={{ width: '100%' }}>
              <Skeleton.Button active style={{ width: 120, height: 16 }} />
              <Skeleton.Button active style={{ width: 80, height: 16 }} />
              <Skeleton.Button active style={{ width: 60, height: 16 }} />
              <Skeleton.Button active style={{ width: 70, height: 16 }} />
            </Flexbox>

            {/* Image grid skeleton - 2x2 layout */}
            <div className={styles.imageGrid}>
              {Array.from({ length: 4 }).map((_, imageIndex) => (
                <div className={styles.imageGridItem} key={imageIndex}>
                  <div className={styles.skeletonFill}>
                    <Skeleton.Button active style={{ width: '100%', height: '100%' }} />
                  </div>
                </div>
              ))}
            </div>
          </Flexbox>
        </div>
      ))}
    </Flexbox>
  );
});

SkeletonList.displayName = 'SkeletonList';

export default SkeletonList;
