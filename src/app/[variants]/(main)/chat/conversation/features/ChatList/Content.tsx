'use client';

import React, { memo, useCallback } from 'react';

import { SkeletonList, VirtualizedList } from '@/features/ChatList';
import WideScreenContainer from '@/features/ChatList/components/WideScreenContainer';
import { useFetchMessages } from '@/hooks/useFetchMessages';
import { useChatStore } from '@/store/chat';
import { displayMessageSelectors } from '@/store/chat/selectors';

import MainChatItem from './ChatItem';
import Welcome from './WelcomeChatItem';

interface ListProps {
  mobile?: boolean;
}

const Content = memo<ListProps>(({ mobile }) => {
  const [isCurrentChatLoaded] = useChatStore((s) => [
    displayMessageSelectors.isCurrentDisplayChatLoaded(s),
  ]);

  useFetchMessages();
  const data = useChatStore(displayMessageSelectors.mainDisplayChatIDs);

  const itemContent = useCallback(
    (index: number, id: string) => <MainChatItem id={id} index={index} />,
    [mobile],
  );

  if (!isCurrentChatLoaded) return <SkeletonList mobile={mobile} />;

  if (data.length === 0)
    return (
      <WideScreenContainer flex={1} height={'100%'}>
        <Welcome />
      </WideScreenContainer>
    );

  return <VirtualizedList dataSource={data} itemContent={itemContent} mobile={mobile} />;
});

Content.displayName = 'ChatListRender';

export default Content;
