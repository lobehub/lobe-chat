'use client';

import { VirtuosoMasonry } from '@virtuoso.dev/masonry';
import { Empty, Skeleton } from 'antd';
import { createStyles } from 'antd-style';
import { memo, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { DisplayContextMemory } from '@/database/repositories/userMemory';
import { useUserMemoryStore } from '@/store/userMemory';

import ContextCard from './ContextCard';
import ContextDrawer from './ContextDrawer';
import ContextTimelineView from './ContextTimelineView';
import ViewModeSwitcher, { ViewMode } from './ViewModeSwitcher';

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
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  `,
}));

interface ContextItemWrapperProps {
  context: {
    onCardClick: (context: DisplayContextMemory) => void;
    onDelete?: (id: string) => void;
    onEdit?: (id: string) => void;
  };
  data: DisplayContextMemory;
}

const ContextItemWrapper = memo<ContextItemWrapperProps>(({ data: context, context: ctx }) => {
  if (!context || !context.id) {
    return null;
  }

  return (
    <div style={{ padding: '8px 4px' }}>
      <ContextCard
        context={context}
        onClick={() => ctx.onCardClick(context)}
        onDelete={ctx.onDelete}
        onEdit={ctx.onEdit}
      />
    </div>
  );
});

ContextItemWrapper.displayName = 'ContextItemWrapper';

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

const ContextsList = memo<{ mobile?: boolean }>(({ mobile }) => {
  const { t } = useTranslation('memory');
  const { styles } = useStyles();
  const { data: contexts, isLoading } = useUserMemoryStore((s) => s.useFetchContexts());
  const [selectedContext, setSelectedContext] = useState<DisplayContextMemory | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [columnCount, setColumnCount] = useState(mobile ? 1 : 2);
  const [isMasonryReady, setIsMasonryReady] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('masonry');

  useEffect(() => {
    if (mobile) {
      setColumnCount(1);
      return;
    }

    const updateColumnCount = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setColumnCount(1);
      } else {
        setColumnCount(2);
      }
    };

    updateColumnCount();
    window.addEventListener('resize', updateColumnCount);
    return () => window.removeEventListener('resize', updateColumnCount);
  }, [mobile]);

  useEffect(() => {
    if (contexts && contexts.length > 0) {
      const timer = setTimeout(() => setIsMasonryReady(true), 100);
      return () => clearTimeout(timer);
    }
  }, [contexts]);

  const handleCardClick = (context: DisplayContextMemory) => {
    setSelectedContext(context);
    setDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setDrawerOpen(false);
  };

  const masonryContext = useMemo(
    () => ({
      onCardClick: handleCardClick,
      onDelete: undefined, // TODO: implement delete
      onEdit: undefined, // TODO: implement edit
    }),
    [],
  );

  if (isLoading) {
    return (
      <Flexbox padding={16}>
        <MasonrySkeleton columnCount={columnCount} />
      </Flexbox>
    );
  }

  if (!contexts || contexts.length === 0) {
    return <Empty description={t('context.empty')} />;
  }

  const renderMasonryView = () => (
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
            ItemContent={ContextItemWrapper}
            columnCount={columnCount}
            context={masonryContext}
            data={contexts}
            style={{ gap: '16px' }}
          />
        </div>
      </div>
    </div>
  );

  return (
    <Flexbox gap={16}>
      <Flexbox horizontal justify="flex-end">
        <ViewModeSwitcher onChange={setViewMode} value={viewMode} />
      </Flexbox>

      {viewMode === 'timeline' ? (
        <ContextTimelineView
          contexts={contexts}
          onClick={handleCardClick}
          onDelete={masonryContext.onDelete}
          onEdit={masonryContext.onEdit}
        />
      ) : (
        renderMasonryView()
      )}

      <ContextDrawer context={selectedContext} onClose={handleDrawerClose} open={drawerOpen} />
    </Flexbox>
  );
});

export default ContextsList;
