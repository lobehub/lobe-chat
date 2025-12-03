import { memo } from 'react';
import { Link } from 'react-router-dom';

import GroupSkeleton from '@/app/[variants]/(main)/home/features/components/GroupSkeleton';
import { RECENT_BLOCK_SIZE } from '@/app/[variants]/(main)/home/features/const';
import { useInitRecentTopic } from '@/hooks/useInitRecentTopic';

import ReactTopicItem from './Item';

const RecentTopicList = memo(() => {
  const { data: recentTopics, isLoading } = useInitRecentTopic();

  if (isLoading) {
    return (
      <GroupSkeleton
        height={RECENT_BLOCK_SIZE.TOPIC.HEIGHT}
        width={RECENT_BLOCK_SIZE.TOPIC.WIDTH}
      />
    );
  }

  if (!recentTopics || recentTopics.length === 0) {
    return null;
  }

  return recentTopics.map((topic) => {
    const topicUrl = `/agent/${topic?.agent?.id || 'inbox'}?topic=${topic.id}`;

    return (
      <Link
        key={topic.id}
        style={{
          color: 'inherit',
          textDecoration: 'none',
        }}
        to={topicUrl}
      >
        <ReactTopicItem {...topic} />
      </Link>
    );
  });
});

export default RecentTopicList;
