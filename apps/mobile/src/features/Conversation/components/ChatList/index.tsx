import { UIChatMessage } from '@lobechat/types';
import { Flexbox, MaskShadow } from '@lobehub/ui-rn';
import { FlashList, type FlashListRef, type ListRenderItem } from '@shopify/flash-list';
import { isLiquidGlassAvailable } from 'expo-glass-effect';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ViewStyle } from 'react-native';
import { useKeyboardHandler } from 'react-native-keyboard-controller';
import { runOnJS } from 'react-native-reanimated';
import { NativeScrollEvent } from 'react-native/Libraries/Components/ScrollView/ScrollView';
import { NativeSyntheticEvent } from 'react-native/Libraries/Types/CoreEventTypes';

import { useChat } from '@/hooks/useChat';
import { useFetchMessages } from '@/hooks/useFetchMessages';
import { useChatStore } from '@/store/chat';
import { chatSelectors } from '@/store/chat/selectors';

import { ChatMessageItem } from '../../Messages';
import { ESTIMATED_MESSAGE_HEIGHT, computeAtBottom } from '../../utils/utils';
import AutoScroll from '../AutoScroll';
import MessageSkeletonList from '../MessageSkeletonList';
import WelcomeMessage from '../WelcomeMessage';

interface ChatListProps {
  style?: ViewStyle;
}

const ChatList = memo<ChatListProps>(({ style }) => {
  const isGlassAvailable = isLiquidGlassAvailable();
  const listRef = useRef<FlashListRef<UIChatMessage>>(null);
  // 触发消息加载
  useFetchMessages();

  const { messages, isGenerating, isLoading } = useChat();
  const isCurrentChatLoaded = useChatStore(chatSelectors.isCurrentChatLoaded);
  const activeId = useChatStore((s) => s.activeId);
  const activeTopicId = useChatStore((s) => s.activeTopicId);
  const [atBottom, setAtBottom] = useState(true);
  const [isScrolling, setIsScrolling] = useState(false);
  const atBottomRef = useRef(true);
  const isAtBottomRefWhenKeyboardStartShow = useRef(true);
  const scrollingTimeoutRef = useRef<any>(null);

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
    return () => {
      setAtBottom(true);
    };
  }, [isCurrentChatLoaded, isGenerating, isLoading, activeId, activeTopicId]);

  const renderItem: ListRenderItem<UIChatMessage> = useCallback(
    ({ item, index }) => (
      <ChatMessageItem index={index} item={item} totalLength={messages.length} />
    ),
    [messages.length],
  );

  const keyExtractor = useCallback((item: UIChatMessage) => item.id, []);

  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const nearBottom = computeAtBottom(
      layoutMeasurement.height,
      contentSize.height,
      contentOffset.y,
    );

    // Detect user scrolling away from bottom (key improvement!)
    // If user was at bottom and now scrolling away, immediately mark as scrolling
    if (atBottomRef.current && !nearBottom) {
      setIsScrolling(true);
      if (scrollingTimeoutRef.current) {
        clearTimeout(scrollingTimeoutRef.current);
      }
    }

    setAtBottom(nearBottom);
    atBottomRef.current = nearBottom;
  }, []);

  // Handle user scroll begin (aligned with web's isScrolling logic)
  const handleScrollBeginDrag = useCallback(() => {
    setIsScrolling(true);
    if (scrollingTimeoutRef.current) {
      clearTimeout(scrollingTimeoutRef.current);
    }
  }, []);

  // Handle scroll end (aligned with web's isScrolling logic)
  const handleScrollEnd = useCallback(() => {
    // Delay setting isScrolling to false to ensure user has finished scrolling
    // Longer delay prevents premature auto-scroll when user pauses briefly
    if (scrollingTimeoutRef.current) {
      clearTimeout(scrollingTimeoutRef.current);
    }
    scrollingTimeoutRef.current = setTimeout(() => {
      setIsScrolling(false);
    }, 300); // Increased from 150ms to 300ms for better UX
  }, []);

  let content;
  // FlashList auto-scroll config (aligned with web)
  // Only enable when user is NOT scrolling to prevent interrupting user's reading
  const maintainVisibleContentPosition = useMemo(
    () => ({
      animateAutoscrollToBottom: true,
      // Only auto-scroll when:
      // 1. AI is generating OR loading
      // 2. User is NOT actively scrolling (key fix!)
      autoscrollToBottomThreshold: (isLoading || isGenerating) && !isScrolling ? 0.2 : undefined,
    }),
    [isGenerating, isLoading, isScrolling],
  );

  const initialScrollIndex = useMemo(
    () => (messages.length > 0 ? messages.length - 1 : undefined),
    [messages.length],
  );

  if (!activeTopicId)
    return (
      <MaskShadow
        size={isGlassAvailable ? 12 : 32}
        style={{
          flex: 1,
          marginBottom: -24,
        }}
      >
        <WelcomeMessage />
      </MaskShadow>
    );

  if (!isCurrentChatLoaded) {
    content = <MessageSkeletonList />;
  } else {
    if (!messages || messages.length === 0) return <WelcomeMessage />;
    content = (
      <>
        <MaskShadow
          size={isGlassAvailable ? 12 : 32}
          style={{
            flex: 1,
            marginBottom: -24,
          }}
        >
          <FlashList
            ListFooterComponent={<Flexbox style={{ height: 48 }} />}
            data={messages}
            drawDistance={400}
            getItemType={(chatMessage) => {
              return chatMessage.role;
            }}
            initialScrollIndex={initialScrollIndex}
            keyExtractor={keyExtractor}
            keyboardShouldPersistTaps="handled"
            maintainVisibleContentPosition={maintainVisibleContentPosition}
            onMomentumScrollEnd={handleScrollEnd}
            onScroll={handleScroll}
            onScrollBeginDrag={handleScrollBeginDrag}
            onScrollEndDrag={handleScrollEnd}
            overrideProps={{ estimatedItemSize: ESTIMATED_MESSAGE_HEIGHT }}
            ref={listRef}
            renderItem={renderItem}
            scrollEventThrottle={isGenerating ? 16 : undefined}
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
            testID="chat-flash-list"
            viewabilityConfig={{
              viewAreaCoveragePercentThreshold: 1,
            }}
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
});

ChatList.displayName = 'ChatList';

export default ChatList;
