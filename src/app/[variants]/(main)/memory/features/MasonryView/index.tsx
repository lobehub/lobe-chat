import { VirtuosoMasonry } from '@virtuoso.dev/masonry';
import { Skeleton } from 'antd';
import { createStyles } from 'antd-style';
import { ReactNode, memo, useEffect, useMemo, useState } from 'react';
import { Flexbox } from 'react-layout-kit';

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
    gap: 16px;
  `,
}));

interface MasonrySkeletonProps {
  columnCount: number;
}

const MasonrySkeleton = memo<MasonrySkeletonProps>(({ columnCount }) => {
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

interface MasonryViewProps<T> {
  /**
   * Default column count
   * Will be responsive based on window width
   */
  defaultColumnCount?: number;
  items: T[];
  renderItem: (item: T, actions: ItemActions<T>) => ReactNode;
}

interface ItemActions<T> {
  onClick?: (item: T) => void;
  onDelete?: (id: string) => void;
  onEdit?: (id: string) => void;
}

function MasonryViewInner<T extends { id: string }>({
  items,
  defaultColumnCount = 2,
  renderItem,
}: MasonryViewProps<T>) {
  const { styles } = useStyles();
  const [columnCount, setColumnCount] = useState(defaultColumnCount);
  const [isMasonryReady, setIsMasonryReady] = useState(false);

  useEffect(() => {
    const updateColumnCount = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setColumnCount(1);
      } else if (defaultColumnCount === 2) {
        setColumnCount(2);
      } else if (width < 1024) {
        setColumnCount(2);
      } else if (width < 1280) {
        setColumnCount(3);
      } else {
        setColumnCount(defaultColumnCount);
      }
    };

    updateColumnCount();
    window.addEventListener('resize', updateColumnCount);
    return () => window.removeEventListener('resize', updateColumnCount);
  }, [defaultColumnCount]);

  useEffect(() => {
    if (items && items.length > 0) {
      const timer = setTimeout(() => setIsMasonryReady(true), 100);
      return () => clearTimeout(timer);
    }
  }, [items]);

  const ItemWrapper = useMemo(
    () =>
      memo<{ context: ItemActions<T>; data: T }>(({ data: item, context: actions }) => {
        if (!item || !item.id) {
          return null;
        }

        return <div style={{ padding: '8px 4px' }}>{renderItem(item, actions)}</div>;
      }),
    [renderItem],
  );

  const masonryContext = useMemo<ItemActions<T>>(
    () => ({
      onClick: undefined,
      onDelete: undefined,
      onEdit: undefined,
    }),
    [],
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
            ItemContent={ItemWrapper}
            columnCount={columnCount}
            context={masonryContext}
            data={items}
            style={{ gap: '16px' }}
          />
        </div>
      </div>
    </div>
  );
}

export const MasonryView = memo(MasonryViewInner) as typeof MasonryViewInner;
