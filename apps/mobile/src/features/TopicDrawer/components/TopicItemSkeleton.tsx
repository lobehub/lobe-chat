import { Flexbox, Skeleton } from '@lobehub/ui-rn';
import { memo } from 'react';

/**
 * Topic 骨架屏组件
 * 可复用的 topic 列表项加载状态
 */
const TopicItemSkeleton = memo(() => (
  <Flexbox paddingBlock={12} paddingInline={16}>
    <Skeleton
      animated
      avatar={{
        size: 16,
      }}
      paragraph={{
        rows: 1,
        width: ['70%'],
      }}
      title={false}
    />
  </Flexbox>
));

TopicItemSkeleton.displayName = 'TopicItemSkeleton';

export default TopicItemSkeleton;
