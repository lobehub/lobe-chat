import React, { useCallback, useRef, useState } from 'react';
import {
  FlatList,
  ListRenderItem,
  NativeScrollEvent,
  NativeSyntheticEvent,
  View,
  ViewStyle,
} from 'react-native';
import { useChat } from '@/hooks/useChat';
import ChatBubble from '../ChatBubble';
import ScrollToBottom from '../ScrollToBottom';
import { useStyles } from './style';
import { ChatMessage } from '@/types/message';

interface ChatListProps {
  onScroll?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  scrollViewRef?: React.RefObject<FlatList<ChatMessage> | null>;
  style?: ViewStyle;
}

export default function ChatList({ style, onScroll, scrollViewRef }: ChatListProps) {
  const internalRef = useRef<FlatList<ChatMessage>>(null);
  const { messages, isLoading } = useChat();
  const { styles } = useStyles();
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);

  const renderItem: ListRenderItem<ChatMessage> = useCallback(
    ({ item, index }) => (
      <ChatBubble
        isLoading={
          index === messages.length - 1 && isLoading && item.role === 'assistant' && !item.content
        }
        key={item.id}
        message={item}
      />
    ),
    [isLoading, messages.length],
  );

  const keyExtractor = useCallback((item: ChatMessage) => item.id, []);

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
      const isAtBottom = contentOffset.y + layoutMeasurement.height >= contentSize.height - 32;
      setShowScrollToBottom(!isAtBottom);
      onScroll?.(event);
    },
    [onScroll],
  );

  const handleScrollToBottom = useCallback(() => {
    const ref = scrollViewRef?.current || internalRef.current;
    ref?.scrollToEnd({ animated: true });
  }, [scrollViewRef]);

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
        onScroll={handleScroll}
        ref={scrollViewRef || internalRef}
        removeClippedSubviews={true}
        renderItem={renderItem}
        scrollEventThrottle={16}
        style={styles.chatContainer}
        windowSize={10}
      />
      <ScrollToBottom onPress={handleScrollToBottom} visible={showScrollToBottom} />
    </View>
  );
}
