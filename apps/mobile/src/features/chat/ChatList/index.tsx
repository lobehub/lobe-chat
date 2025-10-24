import { ChatMessage } from '@lobechat/types';
import { Flexbox, MaskShadow } from '@lobehub/ui-rn';
import { FlashList, type FlashListRef, type ListRenderItem } from '@shopify/flash-list';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { ViewStyle } from 'react-native';
import { useKeyboardHandler } from 'react-native-keyboard-controller';
import { runOnJS } from 'react-native-reanimated';
import { NativeScrollEvent } from 'react-native/Libraries/Components/ScrollView/ScrollView';
import { NativeSyntheticEvent } from 'react-native/Libraries/Types/CoreEventTypes';

import { LOADING_FLAT } from '@/_const/message';
import AutoScroll from '@/features/chat/AutoScroll';
import { useChat } from '@/hooks/useChat';
import { useFetchMessages } from '@/hooks/useFetchMessages';
import { useChatStore } from '@/store/chat';
import { chatSelectors } from '@/store/chat/selectors';

import ChatBubble from '../ChatBubble';
import MessageSkeletonList from '../MessageSkeletonList';
import WelcomeMessage from '../WelcomeMessage';

interface ChatListProps {
  style?: ViewStyle;
}

const AT_BOTTOM_EPSILON = 100;

const computeAtBottom = (layoutH = 0, contentH = 0, offsetY = 0) => {
  const maxOffset = Math.max(0, contentH - layoutH);
  let offset = offsetY;
  if (offset < 0) offset = 0;
  if (offset > maxOffset) offset = maxOffset;

  // If content fits entirely in the viewport, we're at bottom
  if (contentH <= layoutH) return true;

  // Distance from viewport bottom to content bottom
  const distance = contentH - (offset + layoutH);
  return distance <= AT_BOTTOM_EPSILON;
};

const ChatMessageItem = memo<{ index: number; item: ChatMessage; totalLength: number }>(
  ({ item, index, totalLength }) => {
    const isLastMessage = index === totalLength - 1;
    const isAssistant = item.role === 'assistant';
    const isLoadingContent = item.content === LOADING_FLAT;
    const hasError = !!item.error?.type;

    // 如果有错误，即使content是LOADING_FLAT也不应该显示为loading状态
    const shouldShowLoading = isLastMessage && isAssistant && isLoadingContent && !hasError;

    return (
      <ChatBubble isLoading={shouldShowLoading} message={item} showActionsBar={isLastMessage} />
    );
  },
);

ChatMessageItem.displayName = 'ChatMessageItem';

export default function ChatListChatList({ style }: ChatListProps) {
  const listRef = useRef<FlashListRef<ChatMessage>>(null);
  // 触发消息加载
  useFetchMessages();

  const { messages, isGenerating, isLoading } = useChat();
  const isCurrentChatLoaded = useChatStore(chatSelectors.isCurrentChatLoaded);
  const [atBottom, setAtBottom] = useState(true);
  const atBottomRef = useRef(true);
  const isAtBottomRefWhenKeyboardStartShow = useRef(true);

  const updateBottomRef = useCallback(() => {
    isAtBottomRefWhenKeyboardStartShow.current = atBottomRef.current;
  }, []);

  useKeyboardHandler(
    {
      onStart: (e) => {
        'worklet';
        if (e.progress === 1) {
          runOnJS(updateBottomRef)();
        }
      },
    },
    [],
  );

  const scrollToBottom = useCallback((animated: boolean = true) => {
    if (!listRef.current) return;
    listRef.current.scrollToEnd({ animated });
  }, []);

  useEffect(() => {
    if (isCurrentChatLoaded || isLoading || isGenerating) scrollToBottom();
  }, [isCurrentChatLoaded, isGenerating, isLoading]);

  const renderItem: ListRenderItem<ChatMessage> = useCallback(
    ({ item, index }) => (
      <ChatMessageItem index={index} item={item} totalLength={messages.length} />
    ),
    [messages.length],
  );

  const keyExtractor = useCallback((item: ChatMessage) => item.id, []);

  const renderEmptyComponent = useCallback(() => <WelcomeMessage />, []);

  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const nearBottom = computeAtBottom(
      layoutMeasurement.height,
      contentSize.height,
      contentOffset.y,
    );
    setAtBottom(nearBottom);
  }, []);

  let content;

  if (!isCurrentChatLoaded) {
    content = <MessageSkeletonList />;
  } else {
    content = (
      <>
        <MaskShadow size={32} style={{ flex: 1 }}>
          <FlashList
            ListEmptyComponent={renderEmptyComponent}
            data={messages}
            getItemType={(chatMessage) => {
              return chatMessage.role;
            }}
            initialScrollIndex={messages.length - 1}
            keyExtractor={keyExtractor}
            maintainVisibleContentPosition={{
              autoscrollToBottomThreshold: isLoading || isGenerating ? 0.2 : undefined,
              // startRenderingFromBottom: true,
            }}
            onScroll={handleScroll}
            overrideProps={{
              paddingBottom: 16,
            }}
            ref={listRef}
            renderItem={renderItem}
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
          />
        </MaskShadow>
        <AutoScroll
          atBottom={atBottom}
          onScrollToBottom={(type) => {
            switch (type) {
              case 'auto': {
                scrollToBottom(false);
                break;
              }
              case 'click': {
                scrollToBottom(true);
                break;
              }
            }
          }}
        />
      </>
    );
  }

  return (
    <Flexbox flex={1} style={style}>
      {content}
    </Flexbox>
  );
}
