import { memo } from 'react';

import { useFetchThreads } from '@/hooks/useFetchThreads';
import { useChatStore } from '@/store/chat';
import { threadSelectors } from '@/store/chat/selectors';

import ThreadItem from '../ThreadItem';

const ThreadList = memo(() => {
  const [id] = useChatStore((s) => [s.activeTopicId]);
  const threads = useChatStore(threadSelectors.getThreadsByTopic(id));

  useFetchThreads(id);

  return threads?.map((item, index) => (
    <ThreadItem id={item.id} index={index} key={item.id} title={item.title} />
  ));
});

ThreadList.displayName = 'ThreadList';

export default ThreadList;
