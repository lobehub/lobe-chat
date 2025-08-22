import React, { useCallback, useRef } from 'react';
import {
  FlatList,
  ListRenderItem,
  NativeScrollEvent,
  NativeSyntheticEvent,
  View,
  ViewStyle,
} from 'react-native';
import { useChat } from '@/hooks/useChat';
import { useFetchMessages } from '@/hooks/useFetchMessages';
// import ScrollToBottom from '../ScrollToBottom';
import { useStyles } from './style';
import { ChatMessage } from '@/types/message';
import { LOADING_FLAT } from '@/const/message';
import ChatBubble from '../ChatBubble';

interface ChatListProps {
  onScroll?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  scrollViewRef?: React.RefObject<FlatList<ChatMessage> | null>;
  style?: ViewStyle;
}

const ChatMessageItem = React.memo<{ index: number; item: ChatMessage; totalLength: number }>(
  ({ item, index, totalLength }) => {
    const isLastMessage = index === totalLength - 1;
    const isAssistant = item.role === 'assistant';
    const isLoadingContent = item.content === LOADING_FLAT;

    const shouldShowLoading = isLastMessage && isAssistant && isLoadingContent;

    return <ChatBubble isLoading={shouldShowLoading} message={item} />;
  },
);

ChatMessageItem.displayName = 'ChatMessageItem';

export default function ChatList({
  style,
  //  onScroll,
  scrollViewRef,
}: ChatListProps) {
  const internalRef = useRef<FlatList<ChatMessage>>(null);

  // 触发消息加载
  useFetchMessages();

  const { messages } = useChat();
  const { styles } = useStyles();
  // const [showScrollToBottom, setShowScrollToBottom] = useState(false);

  const renderItem: ListRenderItem<ChatMessage> = useCallback(
    ({ item, index }) => (
      <ChatMessageItem index={index} item={item} key={item.id} totalLength={messages.length} />
    ),
    [messages.length],
  );

  const keyExtractor = useCallback((item: ChatMessage) => item.id, []);

  // const handleScroll = useCallback(
  //   (event: NativeSyntheticEvent<NativeScrollEvent>) => {
  //     const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
  //     const isAtBottom = contentOffset.y + layoutMeasurement.height >= contentSize.height - 32;
  //     setShowScrollToBottom(!isAtBottom);
  //     onScroll?.(event);
  //   },
  //   [onScroll],
  // );

  // const handleScrollToBottom = useCallback(() => {
  //   const ref = scrollViewRef?.current || internalRef.current;
  //   ref?.scrollToEnd({ animated: true });
  // }, [scrollViewRef]);

  const handleContentSizeChange = useCallback(() => {
    const ref = scrollViewRef?.current || internalRef.current;
    if (ref && messages.length > 0) {
      ref.scrollToEnd({ animated: true });
    }
  }, [scrollViewRef, messages.length]);

  return (
    <View style={[{ flex: 1 }, style]}>
      <FlatList
        data={messages}
        initialNumToRender={10}
        keyExtractor={keyExtractor}
        maxToRenderPerBatch={10}
        onContentSizeChange={handleContentSizeChange}
        onLayout={handleContentSizeChange}
        // onScroll={handleScroll}
        ref={scrollViewRef || internalRef}
        removeClippedSubviews={true}
        renderItem={renderItem}
        scrollEventThrottle={16}
        style={styles.chatContainer}
        windowSize={10}
      />
      {/* <ScrollToBottom onPress={handleScrollToBottom} visible={showScrollToBottom} /> */}
    </View>
  );
}
