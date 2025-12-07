import { VirtuosoMasonry } from '@virtuoso.dev/masonry';
import { ReactNode, memo, useEffect, useMemo, useState } from 'react';

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
  const [columnCount, setColumnCount] = useState(defaultColumnCount);

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
    <VirtuosoMasonry
      ItemContent={ItemWrapper}
      columnCount={columnCount}
      context={masonryContext}
      data={items}
      style={{ gap: 4 }}
    />
  );
}

export const MasonryView = memo(MasonryViewInner) as typeof MasonryViewInner;
