import { Grid, GridProps } from '@lobehub/ui';
import { forwardRef, memo } from 'react';
import { Flexbox, FlexboxProps } from 'react-layout-kit';
import { VirtuosoGrid, VirtuosoGridProps } from 'react-virtuoso';

import { useScrollParent } from './useScrollParent';

const GridList = forwardRef<HTMLDivElement, GridProps>((props, ref) => (
  <Grid gap={16} maxItemWidth={280} ref={ref} rows={4} {...props} />
));

const List = forwardRef<HTMLDivElement, FlexboxProps>((props, ref) => (
  <Flexbox gap={16} ref={ref} {...props} />
));

export const VirtuosoList = memo<VirtuosoGridProps<any, any>>(({ data, ...rest }) => {
  const scrollParent = useScrollParent();
  const initialItemCount = data && data?.length >= 8 ? 8 : data?.length;
  return (
    <VirtuosoGrid
      components={{ List: List }}
      customScrollParent={scrollParent}
      data={data}
      initialItemCount={initialItemCount}
      overscan={400}
      {...rest}
    />
  );
});

const VirtuosoGridList = memo<VirtuosoGridProps<any, any>>(
  ({ data, initialItemCount, ...rest }) => {
    const scrollParent = useScrollParent();
    const count = data && data?.length >= 8 ? 8 : data?.length;
    const maxInitialItemCount =
      data && data?.length && initialItemCount && initialItemCount > data?.length
        ? data?.length
        : initialItemCount;
    return (
      <VirtuosoGrid
        components={{ List: GridList }}
        customScrollParent={scrollParent}
        data={data}
        initialItemCount={maxInitialItemCount || count}
        overscan={400}
        {...rest}
      />
    );
  },
);

export default VirtuosoGridList;
