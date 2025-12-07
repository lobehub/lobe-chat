import { Grid } from '@lobehub/ui';
import dayjs from 'dayjs';
import { ReactNode, memo, useMemo } from 'react';

export interface GridViewProps<T extends { createdAt: Date | string; id: string }> {
  /**
   * Custom date field extractor for sorting
   */
  getDateForSorting?: (item: T) => Date | string;
  items: T[];
  renderItem: (item: T) => ReactNode;
  /**
   * Number of rows in the grid
   * @default 3
   */
  rows?: number;
}

function GridViewInner<T extends { createdAt: Date | string; id: string }>({
  items,
  rows = 3,
  getDateForSorting,
  renderItem,
}: GridViewProps<T>) {
  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      const dateA = getDateForSorting ? getDateForSorting(a) : a.createdAt;
      const dateB = getDateForSorting ? getDateForSorting(b) : b.createdAt;
      return dayjs(dateB).valueOf() - dayjs(dateA).valueOf();
    });
  }, [items, getDateForSorting]);

  return (
    <Grid gap={16} rows={rows}>
      {sortedItems.map((item) => (
        <div key={item.id}>{renderItem(item)}</div>
      ))}
    </Grid>
  );
}

export const GridView = memo(GridViewInner) as typeof GridViewInner;
