import { memo } from 'react';
import { Virtuoso, VirtuosoProps } from 'react-virtuoso';

import { useScrollParent } from './hooks/ScrollParentProvider';

const VList = memo<VirtuosoProps<any, any>>(({ data = [], itemContent, ...rest }) => {
  const scrollRef = useScrollParent();
  const initialItemCount = data && data?.length >= 20 ? 20 : data?.length;

  return (
    <Virtuoso
      customScrollParent={scrollRef?.current ?? undefined}
      data={data}
      defaultItemHeight={34}
      fixedItemHeight={34}
      increaseViewportBy={800}
      initialItemCount={initialItemCount}
      itemContent={itemContent}
      overscan={20}
      totalCount={data?.length}
      {...rest}
    />
  );
});

export default VList;
