import { VirtuosoMasonry } from '@virtuoso.dev/masonry';
import { Skeleton } from 'antd';
import { createStyles } from 'antd-style';
import { memo, useEffect, useMemo, useState } from 'react';
import { Flexbox } from 'react-layout-kit';

import { DisplayPreferenceMemory } from '@/database/repositories/userMemory';

import PreferenceCard from './PreferenceCard';

const useStyles = createStyles(({ css }) => ({
  container: css`
    position: relative;
    overflow: hidden;
    flex: 1;
  `,
  masonryContainer: css`
    overflow-y: auto;
    height: 100%;
  `,
  masonryContent: css`
    padding-block-end: 64px;
  `,
  skeletonContainer: css`
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
  `,
}));

interface PreferenceItemWrapperProps {
  context: {
    onCardClick: (preference: DisplayPreferenceMemory) => void;
    onDelete?: (id: string) => void;
    onEdit?: (id: string) => void;
  };
  data: DisplayPreferenceMemory;
}

const PreferenceItemWrapper = memo<PreferenceItemWrapperProps>(({ data: preference, context }) => {
  if (!preference || !preference.id) {
    return null;
  }

  return (
    <div style={{ padding: '8px 4px' }}>
      <PreferenceCard
        onClick={() => context.onCardClick(preference)}
        onDelete={context.onDelete}
        onEdit={context.onEdit}
        preference={preference}
      />
    </div>
  );
});

PreferenceItemWrapper.displayName = 'PreferenceItemWrapper';

const MasonrySkeleton = memo<{ columnCount: number }>(({ columnCount }) => {
  const { styles } = useStyles();

  return (
    <div
      className={styles.skeletonContainer}
      style={{ gridTemplateColumns: `repeat(${columnCount}, 1fr)` }}
    >
      {Array.from({ length: 8 }).map((_, index) => (
        <Skeleton.Node
          active
          key={index}
          style={{ borderRadius: 8, height: 120 + Math.random() * 80, width: '100%' }}
        />
      ))}
    </div>
  );
});

MasonrySkeleton.displayName = 'MasonrySkeleton';

interface MasonryViewProps {
  onClick: (preference: DisplayPreferenceMemory) => void;
  onDelete?: (id: string) => void;
  onEdit?: (id: string) => void;
  preferences: DisplayPreferenceMemory[];
}

const MasonryView = memo<MasonryViewProps>(({ preferences, onClick, onDelete, onEdit }) => {
  const { styles } = useStyles();
  const [columnCount, setColumnCount] = useState(4);
  const [isMasonryReady, setIsMasonryReady] = useState(false);

  useEffect(() => {
    const updateColumnCount = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setColumnCount(1);
      } else if (width < 1024) {
        setColumnCount(2);
      } else if (width < 1280) {
        setColumnCount(3);
      } else {
        setColumnCount(4);
      }
    };

    updateColumnCount();
    window.addEventListener('resize', updateColumnCount);
    return () => window.removeEventListener('resize', updateColumnCount);
  }, []);

  useEffect(() => {
    if (preferences && preferences.length > 0) {
      const timer = setTimeout(() => setIsMasonryReady(true), 100);
      return () => clearTimeout(timer);
    }
  }, [preferences]);

  const masonryContext = useMemo(
    () => ({
      onCardClick: onClick,
      onDelete,
      onEdit,
    }),
    [onClick, onDelete, onEdit],
  );

  return (
    <div className={styles.container}>
      {!isMasonryReady && (
        <div
          style={{
            background: 'inherit',
            inset: 0,
            position: 'absolute',
            zIndex: 10,
          }}
        >
          <Flexbox padding={16}>
            <MasonrySkeleton columnCount={columnCount} />
          </Flexbox>
        </div>
      )}
      <div
        className={styles.masonryContainer}
        style={{
          opacity: isMasonryReady ? 1 : 0,
          transition: 'opacity 0.2s ease-in-out',
        }}
      >
        <div className={styles.masonryContent}>
          <VirtuosoMasonry
            ItemContent={PreferenceItemWrapper}
            columnCount={columnCount}
            context={masonryContext}
            data={preferences}
            style={{ gap: '16px' }}
          />
        </div>
      </div>
    </div>
  );
});

export default MasonryView;
