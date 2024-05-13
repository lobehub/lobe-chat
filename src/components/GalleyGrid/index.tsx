import { useResponsive } from 'antd-style';
import { ReactNode, memo, useMemo } from 'react';
import { Flexbox } from 'react-layout-kit';

import Grid from './Grid';
import { MAX_SIZE_DESKTOP, MAX_SIZE_MOBILE } from './style';

interface GalleyGridProps<T = any> {
  items: T[];
  renderItem: (props: T) => ReactNode;
}

const GalleyGrid = memo<GalleyGridProps>(({ items, renderItem: Render }) => {
  const { mobile } = useResponsive();

  const { firstRow, lastRow } = useMemo(() => {
    if (items.length === 4) {
      return {
        firstRow: items.slice(0, 2),
        lastRow: items.slice(2, 4),
      };
    }

    const firstCol = items.length % 3 === 0 ? 3 : items.length % 3;

    return {
      firstRow: items.slice(0, firstCol),
      lastRow: items.slice(firstCol, items.length),
    };
  }, [items]);

  const { gap, max } = useMemo(
    () => ({
      gap: mobile ? 4 : 6,
      max: mobile ? MAX_SIZE_MOBILE : MAX_SIZE_DESKTOP,
    }),
    [mobile],
  );

  return (
    <Flexbox gap={gap}>
      <Grid col={firstRow.length} gap={gap} max={max}>
        {firstRow.map((i, index) => (
          <Render {...i} index={index} key={index} />
        ))}
      </Grid>
      {lastRow.length > 0 && (
        <Grid col={lastRow.length > 2 ? 3 : lastRow.length} gap={gap} max={max}>
          {lastRow.map((i, index) => (
            <Render {...i} index={index} key={index} />
          ))}
        </Grid>
      )}
    </Flexbox>
  );
});

export default GalleyGrid;
