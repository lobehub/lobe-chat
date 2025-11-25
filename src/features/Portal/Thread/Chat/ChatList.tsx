import React, { memo, useCallback } from 'react';
import { Flexbox } from 'react-layout-kit';

import { SkeletonList, VirtualizedList } from '@/features/ChatList';
import { useFetchThreads } from '@/hooks/useFetchThreads';
import { useChatStore } from '@/store/chat';
import { threadSelectors } from '@/store/chat/selectors';

import ThreadChatItem from './ChatItem';

interface ChatListProps {
  mobile?: boolean;
}

const ChatList = memo(({ mobile }: ChatListProps) => {
  const data = useChatStore(threadSelectors.portalDisplayChatIDs);
  const isInit = useChatStore((s) => s.threadsInit);

  useFetchThreads();

  const itemContent = useCallback(
    (index: number, id: string) => <ThreadChatItem id={id} index={index} />,
    [mobile],
  );

  if (!isInit)
    return (
      <Flexbox flex={1} height={'100%'}>
        <SkeletonList mobile={mobile} />
      </Flexbox>
    );

  return (
    <Flexbox
      flex={1}
      style={{
        overflowX: 'hidden',
        overflowY: 'auto',
        position: 'relative',
      }}
      width={'100%'}
    >
      <VirtualizedList dataSource={data} itemContent={itemContent} mobile={mobile} />
    </Flexbox>
  );
});

export default ChatList;
