import { memo } from 'react';
import { Link } from 'react-router-dom';

import GroupSkeleton from '@/app/[variants]/(main)/home/features/components/GroupSkeleton';
import { RECENT_BLOCK_SIZE } from '@/app/[variants]/(main)/home/features/const';
import { useSessionStore } from '@/store/session';
import { recentSelectors } from '@/store/session/selectors';

import ReactTopicItem from './Item';

const RecentTopicList = memo(() => {
  const recentTopics = useSessionStore(recentSelectors.recentTopics);
  const isInit = useSessionStore(recentSelectors.isRecentTopicsInit);

  // Loading state
  if (!isInit) {
    return (
      <GroupSkeleton
        height={RECENT_BLOCK_SIZE.TOPIC.HEIGHT}
        width={RECENT_BLOCK_SIZE.TOPIC.WIDTH}
      />
    );
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
