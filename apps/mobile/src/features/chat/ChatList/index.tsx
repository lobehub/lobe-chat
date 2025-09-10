import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  InteractionManager,
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  View,
  ViewStyle,
} from 'react-native';
import { FlashList, type ListRenderItem, type FlashListRef } from '@shopify/flash-list';
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
import { useKeyboardHandler, useKeyboardState } from 'react-native-keyboard-controller';
import { runOnJS } from 'react-native-reanimated';
import AutoScroll from '@/features/chat/AutoScroll';

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
  const listRef = useRef<FlashListRef<ChatMessage>>(null);
  // 触发消息加载
  useFetchMessages();

  const { messages } = useChat();
  const { styles } = useStyles();
  const isCurrentChatLoaded = useChatStore(chatSelectors.isCurrentChatLoaded);
  const [isScrolling, setIsScrolling] = useState(false);
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
  const { isVisible } = useKeyboardState();

  useEffect(() => {
    if (isVisible && isAtBottomRefWhenKeyboardStartShow.current) {
      listRef.current?.scrollToEnd({ animated: true });
    }
  }, [isVisible]);

  // Track scrolling states precisely: user drag, momentum, and programmatic scrolls
  const isDraggingRef = useRef(false);
  const isMomentumRef = useRef(false);
  // Remove programmatic-scroll flag; treat any animated movement as scrolling

  // Track last measurements to compute atBottom across events
  const layoutHeightRef = useRef(0);
  const contentHeightRef = useRef(0);
  const scrollYRef = useRef(0);

  // Minimal tolerance for rounding/bounce
  const AT_BOTTOM_EPSILON = 2;

  const computeAtBottom = useCallback(() => {
    const layoutH = layoutHeightRef.current || 0;
    const contentH = contentHeightRef.current || 0;
    // Guard and clamp offset to avoid bounce/overscroll affecting result
    let offsetY = scrollYRef.current || 0;
    const maxOffset = Math.max(0, contentH - layoutH);
    if (offsetY < 0) offsetY = 0;
    if (offsetY > maxOffset) offsetY = maxOffset;

    // If content fits entirely in the viewport, we're at bottom
    if (contentH <= layoutH) return true;

    // Distance from viewport bottom to content bottom
    const distance = contentH - (offsetY + layoutH);
    return distance <= AT_BOTTOM_EPSILON;
  }, []);

  const updateAtBottom = useCallback((next: boolean) => {
    if (atBottomRef.current !== next) {
      atBottomRef.current = next;
      setAtBottom(next);
    }
  }, []);

  const renderItem: ListRenderItem<ChatMessage> = useCallback(
    ({ item, index }) => (
      <ChatMessageItem index={index} item={item} totalLength={messages.length} />
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

      const nearBottom = computeAtBottom();
      if (nearBottom) {
        updateAtBottom(true);
      } else if (isDraggingRef.current || isMomentumRef.current) {
        // Only mark as not-at-bottom when the user is actively scrolling away
        updateAtBottom(false);
      }
    },
    [computeAtBottom, updateAtBottom],
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
    setIsScrolling(true);
  }, []);

  const handleMomentumScrollEnd = useCallback(() => {
    isMomentumRef.current = false;
    if (!isDraggingRef.current) {
      setIsScrolling(false);
    }
  }, []);

  const handleContentSizeChange = useCallback(
    (_w: number, h: number) => {
      contentHeightRef.current = h;
      if (atBottomRef.current && !isScrolling) {
        InteractionManager.runAfterInteractions(() => {
          listRef.current?.scrollToEnd({ animated: true });
        });
        updateAtBottom(true);
      } else {
        const nextAtBottom = computeAtBottom();
        updateAtBottom(nextAtBottom);
      }
    },
    [computeAtBottom, updateAtBottom, isScrolling],
  );

  const handleLayout = useCallback(
    (e: LayoutChangeEvent) => {
      layoutHeightRef.current = e.nativeEvent.layout.height;
      const nextAtBottom = computeAtBottom();
      updateAtBottom(nextAtBottom);
    },
    [computeAtBottom, updateAtBottom],
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
      <FlashList
        ListEmptyComponent={renderEmptyComponent}
        data={messages}
        getItemType={(chatMessage) => {
          return chatMessage.role;
        }}
        keyExtractor={keyExtractor}
        onContentSizeChange={handleContentSizeChange}
        onLayout={handleLayout}
        onMomentumScrollBegin={handleMomentumScrollBegin}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        onScroll={handleScroll}
        onScrollBeginDrag={handleScrollBeginDrag}
        onScrollEndDrag={handleScrollEndDrag}
        ref={listRef}
        renderItem={renderItem}
      />
      <AutoScroll
        atBottom={atBottom}
        onScrollToBottom={(type) => {
          const flatList = listRef.current;
          switch (type) {
            case 'auto': {
              flatList?.scrollToEnd({ animated: false });
              break;
            }
            case 'click': {
              flatList?.scrollToEnd({ animated: true });
              break;
            }
          }
        }}
      />
    </View>
  );
}
