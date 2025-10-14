import { memo } from 'react';

import { Cell, Skeleton } from '@/components';

const ProviderCardSkeleton = memo(() => {
  return (
    <Cell
      icon={<Skeleton.Avatar animated={true} size={28} />}
      iconSize={28}
      title={<Skeleton animated={true} paragraph={false} />}
    />
  );
});

export default ProviderCardSkeleton;
