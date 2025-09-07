import React, { useCallback, useRef, useState } from 'react';
import {
  FlatList,
  ListRenderItem,
  NativeScrollEvent,
  NativeSyntheticEvent,
  LayoutChangeEvent,
  View,
  ViewStyle,
} from 'react-native';
import { useChat } from '@/hooks/useChat';
import { useFetchMessages } from '@/hooks/useFetchMessages';
import { useChatStore } from '@/store/chat';
import { chatSelectors } from '@/store/chat/selectors';
import MessageSkeletonList from '../MessageSkeletonList';
import WelcomeMessage from '../WelcomeMessage';
import { useStyles } from './style';
import { ChatMessage } from '@/types/message';
import { LOADING_FLAT } from '@/const/message';
import ChatBubble from '../ChatBubble';
import AutoScroll from '../AutoScroll';

interface ChatListProps {
  style?: ViewStyle;
}

const ChatMessageItem = React.memo<{ index: number; item: ChatMessage; totalLength: number }>(
  ({ item, index, totalLength }) => {
    const isLastMessage = index === totalLength - 1;
    const isAssistant = item.role === 'assistant';
    const isLoadingContent = item.content === LOADING_FLAT;
    const hasError = !!item.error?.type;

    // 如果有错误，即使content是LOADING_FLAT也不应该显示为loading状态
    const shouldShowLoading = isLastMessage && isAssistant && isLoadingContent && !hasError;

    return <ChatBubble isLoading={shouldShowLoading} message={item} />;
  },
);

ChatMessageItem.displayName = 'ChatMessageItem';

export default function ChatListChatList({ style }: ChatListProps) {
  const listRef = useRef<FlatList<ChatMessage>>(null);

  // 触发消息加载
  useFetchMessages();

  const { messages } = useChat();
  const { styles } = useStyles();
  const isCurrentChatLoaded = useChatStore(chatSelectors.isCurrentChatLoaded);
  const [isScrolling, setIsScrolling] = useState(false);
  const [atBottom, setAtBottom] = useState(true);

  // Track scrolling states precisely: user drag, momentum, and programmatic scrolls
  const isDraggingRef = useRef(false);
  const isMomentumRef = useRef(false);
  const isAutoScrollingRef = useRef(false);

  // Track last measurements to compute atBottom across events
  const layoutHeightRef = useRef(0);
  const contentHeightRef = useRef(0);
  const scrollYRef = useRef(0);

  const BOTTOM_TOLERANCE = 32; // px threshold to consider we're at bottom

  const computeAtBottom = useCallback(() => {
    const layoutH = layoutHeightRef.current;
    const contentH = contentHeightRef.current;
    const offsetY = scrollYRef.current;

    if (contentH <= layoutH) return true; // content fits; considered bottom
    return offsetY + layoutH >= contentH - BOTTOM_TOLERANCE;
  }, []);

  const renderItem: ListRenderItem<ChatMessage> = useCallback(
    ({ item, index }) => (
      <ChatMessageItem index={index} item={item} key={item.id} totalLength={messages.length} />
    ),
    [messages.length],
  );

  const keyExtractor = useCallback((item: ChatMessage) => item.id, []);

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
      layoutHeightRef.current = layoutMeasurement.height;
      contentHeightRef.current = contentSize.height;
      scrollYRef.current = contentOffset.y;

      const nextAtBottom = computeAtBottom();
      setAtBottom((prev) => (prev !== nextAtBottom ? nextAtBottom : prev));
    },
    [computeAtBottom],
  );

  const handleScrollBeginDrag = useCallback(() => {
    isDraggingRef.current = true;
    setIsScrolling(true);
  }, []);

  const handleScrollEndDrag = useCallback(() => {
    isDraggingRef.current = false;
    // If no momentum started, scrolling stops here
    if (!isMomentumRef.current) {
      setIsScrolling(false);
    }
  }, []);

  const handleMomentumScrollBegin = useCallback(() => {
    isMomentumRef.current = true;
    // Ignore programmatic auto-scroll when setting isScrolling
    if (!isAutoScrollingRef.current) {
      setIsScrolling(true);
    }
  }, []);

  const handleMomentumScrollEnd = useCallback(() => {
    isMomentumRef.current = false;
    isAutoScrollingRef.current = false;
    if (!isDraggingRef.current) {
      setIsScrolling(false);
    }
  }, []);

  const handleContentSizeChange = useCallback(
    (w: number, h: number) => {
      contentHeightRef.current = h;
      const nextAtBottom = computeAtBottom();
      setAtBottom((prev) => (prev !== nextAtBottom ? nextAtBottom : prev));
    },
    [computeAtBottom],
  );

  const handleLayout = useCallback(
    (e: LayoutChangeEvent) => {
      layoutHeightRef.current = e.nativeEvent.layout.height;
      const nextAtBottom = computeAtBottom();
      setAtBottom((prev) => (prev !== nextAtBottom ? nextAtBottom : prev));
    },
    [computeAtBottom],
  );

  const renderEmptyComponent = useCallback(() => <WelcomeMessage />, []);

  if (!isCurrentChatLoaded) {
    return (
      <View style={[{ flex: 1 }, style]}>
        <MessageSkeletonList />
      </View>
    );
  }

  return (
    <View style={[styles.chatContainer, style]}>
      <FlatList
        ListEmptyComponent={renderEmptyComponent}
        data={messages}
        initialNumToRender={10}
        keyExtractor={keyExtractor}
        maxToRenderPerBatch={10}
        onContentSizeChange={handleContentSizeChange}
        onLayout={handleLayout}
        onMomentumScrollBegin={handleMomentumScrollBegin}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        onScroll={handleScroll}
        onScrollBeginDrag={handleScrollBeginDrag}
        onScrollEndDrag={handleScrollEndDrag}
        ref={listRef}
        removeClippedSubviews={true}
        renderItem={renderItem}
        scrollEventThrottle={16}
        windowSize={10}
      />
      <AutoScroll
        atBottom={atBottom}
        isScrolling={isScrolling}
        onScrollToBottom={() => {
          const flatList = listRef.current;
          isAutoScrollingRef.current = true;
          flatList?.scrollToEnd({ animated: true });
        }}
      />
    </View>
  );
}
