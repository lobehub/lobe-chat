'use client';

import { Skeleton } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { memo, useEffect, useState } from 'react';
import { Flexbox } from 'react-layout-kit';

import EditorCanvas from '../EditorCanvas';
import { usePageEditorStore } from '../store';
import Title from './Title';

const useStyles = createStyles(({ css, token }) => ({
  loadingOverlay: css`
    position: absolute;
    inset: 0;
    z-index: 10;
    background: ${token.colorBgContainer};
    padding: 24px;
  `,
}));

const Body = memo(() => {
  const { styles } = useStyles();
  const isLoadingContent = usePageEditorStore((s) => s.isLoadingContent);
  const [showSkeleton, setShowSkeleton] = useState(false);

  // Only show skeleton if loading takes more than 1 second
  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (isLoadingContent) {
      timer = setTimeout(() => {
        setShowSkeleton(true);
      }, 1000);
    } else {
      setShowSkeleton(false);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isLoadingContent]);

  return (
    <Flexbox flex={1} style={{ overflowY: 'auto', position: 'relative' }}>
      <Title />
      <EditorCanvas />
      {/* Show overlay immediately to hide old content */}
      {isLoadingContent && (
        <div className={styles.loadingOverlay}>
          {/* Only show skeleton after 1 second */}
          {showSkeleton && (
            <Flexbox gap={16}>
              <Skeleton.Title width="80%" />
              <Skeleton.Title width="60%" />
              <Skeleton.Title width="70%" />
              <Skeleton.Title width="50%" />
              <Skeleton.Title width="65%" />
            </Flexbox>
          )}
        </div>
      )}
    </Flexbox>
  );
});

export default Body;
