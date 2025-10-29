import { Flexbox, Skeleton } from '@lobehub/ui-rn';

import { AVATAR_SIZE_MEDIUM } from '@/_const/common';

export const AgentCardSkeleton = () => {
  return (
    <Flexbox padding={12}>
      <Skeleton
        animated
        avatar={{
          size: AVATAR_SIZE_MEDIUM,
        }}
        paragraph={{
          rows: 2,
          width: ['100%', '50%'],
        }}
      />
    </Flexbox>
  );
};

export const AssistantListSkeleton = ({ count = 8 }: { count?: number }) => {
  return Array.from({ length: count }).map((_, index) => <AgentCardSkeleton key={index} />);
};

export const AssistantListPageSkeleton = () => {
  return <AssistantListSkeleton count={8} />;
};

export default AssistantListPageSkeleton;
