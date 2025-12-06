'use client';

import { VirtuosoMasonry } from '@virtuoso.dev/masonry';
import { Empty, Skeleton } from 'antd';
import { createStyles } from 'antd-style';
import { memo, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { DisplayExperienceMemory } from '@/database/repositories/userMemory';
import { useUserMemoryStore } from '@/store/userMemory';

import ExperienceCard from './ExperienceCard';
import ExperienceDrawer from './ExperienceDrawer';
import ExperienceTimelineView from './ExperienceTimelineView';
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
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
  `,
}));

interface ExperienceItemWrapperProps {
  context: {
    onCardClick: (experience: DisplayExperienceMemory) => void;
    onDelete?: (id: string) => void;
    onEdit?: (id: string) => void;
  };
  data: DisplayExperienceMemory;
}

const ExperienceItemWrapper = memo<ExperienceItemWrapperProps>(({ data: experience, context }) => {
  if (!experience || !experience.id) {
    return null;
  }

  return (
    <div style={{ padding: '8px 4px' }}>
      <ExperienceCard
        experience={experience}
        onClick={() => context.onCardClick(experience)}
        onDelete={context.onDelete}
        onEdit={context.onEdit}
      />
    </div>
  );
});

ExperienceItemWrapper.displayName = 'ExperienceItemWrapper';

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

const ExperiencesList = memo<{ mobile?: boolean }>(({ mobile }) => {
  const { t } = useTranslation('memory');
  const { styles } = useStyles();
  const { data: experiences, isLoading } = useUserMemoryStore((s) => s.useFetchExperiences());
  const [selectedExperience, setSelectedExperience] = useState<DisplayExperienceMemory | null>(
    null,
  );
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [columnCount, setColumnCount] = useState(mobile ? 1 : 4);
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
  }, [mobile]);

  useEffect(() => {
    if (experiences && experiences.length > 0) {
      const timer = setTimeout(() => setIsMasonryReady(true), 100);
      return () => clearTimeout(timer);
    }
  }, [experiences]);

  const handleCardClick = (experience: DisplayExperienceMemory) => {
    setSelectedExperience(experience);
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

  if (!experiences || experiences.length === 0) {
    return <Empty description={t('experience.empty')} />;
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
            ItemContent={ExperienceItemWrapper}
            columnCount={columnCount}
            context={masonryContext}
            data={experiences}
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
        <ExperienceTimelineView
          experiences={experiences}
          onCardClick={handleCardClick}
          onDelete={masonryContext.onDelete}
          onEdit={masonryContext.onEdit}
        />
      ) : (
        renderMasonryView()
      )}

      <ExperienceDrawer
        experience={selectedExperience}
        onClose={handleDrawerClose}
        open={drawerOpen}
      />
    </Flexbox>
  );
});

export default ExperiencesList;
