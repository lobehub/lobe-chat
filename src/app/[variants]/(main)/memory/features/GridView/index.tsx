import { Grid , DivProps } from '@lobehub/ui';
import { ReactNode, forwardRef, memo } from 'react';
import { VirtuosoGrid } from 'react-virtuoso';

import { useScrollParent } from '../TimeLineView/useScrollParent';

interface GridViewProps<T> {
  /**
   * Default column count (rows in Grid component)
   * Will be responsive based on window width
   */
  defaultColumnCount?: number;
  /**
   * Whether there are more items to load
   */
  hasMore?: boolean;
  /**
   * Whether data is currently loading
   */
  isLoading?: boolean;
  items: T[];
  /**
   * Max item width in pixels
   */
  maxItemWidth?: number;
  /**
   * Callback when end is reached
   */
  onLoadMore?: () => void;
  renderItem: (item: T, actions: ItemActions<T>) => ReactNode;
}

interface ItemActions<T> {
  onClick?: (item: T) => void;
  onDelete?: (id: string) => void;
  onEdit?: (id: string) => void;
}

function GridViewInner<T extends { id: string }>({
  items,
  defaultColumnCount = 3,
  maxItemWidth = 360,
  hasMore,
  isLoading,
  onLoadMore,
  renderItem,
}: GridViewProps<T>) {
  const scrollParent = useScrollParent();

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <VirtuosoGrid
      components={{
        Footer: isLoading
          ? () => (
              <div style={{ gridColumn: '1 / -1', padding: '24px', textAlign: 'center' }}>
                <div className="ant-spin ant-spin-spinning">
                  <span className="ant-spin-dot ant-spin-dot-spin">
                    <i className="ant-spin-dot-item" />
                    <i className="ant-spin-dot-item" />
                    <i className="ant-spin-dot-item" />
                    <i className="ant-spin-dot-item" />
                  </span>
                </div>
              </div>
            )
          : undefined,
        List: forwardRef<HTMLDivElement, DivProps>((props, ref) => (
          <Grid
            gap={16}
            maxItemWidth={maxItemWidth}
            ref={ref}
            rows={defaultColumnCount}
            {...props}
          />
        )),
      }}
      customScrollParent={scrollParent}
      data={items}
      endReached={hasMore && onLoadMore ? onLoadMore : undefined}
      increaseViewportBy={800}
      itemContent={(index, item) => {
        if (!item || !item.id) {
          return null;
        }

        const actions: ItemActions<T> = {
          onClick: undefined,
          onDelete: undefined,
          onEdit: undefined,
        };

        return renderItem(item, actions);
      }}
      overscan={24}
      style={{ minHeight: '100%' }}
    />
  );
}

export const GridView = memo(GridViewInner) as typeof GridViewInner;
