import { Grid, GridProps } from '@lobehub/ui';
import { forwardRef, memo } from 'react';
import { VirtuosoGrid, VirtuosoGridProps } from 'react-virtuoso';

import { useScrollParent } from './useScrollParent';

const List = forwardRef<HTMLDivElement, GridProps>((props, ref) => (
  <Grid maxItemWidth={280} ref={ref} rows={4} {...props} />
));

const VirtuosoGridList = memo<VirtuosoGridProps<any, any>>(({ data, ...rest }) => {
  const scrollParent = useScrollParent();
  const initialItemCount = data && data?.length >= 8 ? 8 : data?.length;
  return (
    <VirtuosoGrid
      components={{ List }}
      customScrollParent={scrollParent}
      data={data}
      initialItemCount={initialItemCount}
      overscan={400}
      {...rest}
    />
  );
});

export default VirtuosoGridList;
