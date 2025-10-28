import { Flexbox, Skeleton } from '@lobehub/ui-rn';

import { AVATAR_SIZE_MEDIUM } from '@/_const/common';

// Session List Skeleton (for multiple items)
export const SessionListSkeleton = ({ count = 5 }: { count?: number }) => {
  return (
    <Flexbox flex={1}>
      {/* Session items skeleton */}
      {Array.from({ length: count }).map((_, index) => (
        <Skeleton
          align={'center'}
          animated
          avatar={{
            shape: 'circle',
            size: AVATAR_SIZE_MEDIUM,
          }}
          key={index}
          padding={12}
          paragraph={{
            rows: 1,
            width: '100%',
          }}
        />
      ))}
    </Flexbox>
  );
};

export default SessionListSkeleton;
