import { ChatMessage } from '@lobechat/types';
import { Avatar, Block, Flexbox, Markdown, Text } from '@lobehub/ui-rn';
import { memo, useMemo } from 'react';
import { View } from 'react-native';

import { DEFAULT_AVATAR } from '@/_const/meta';
import { useSettingStore } from '@/store/setting';
import { formatTime } from '@/utils/formatTime';

import AssistantMenu from '../AssistantMenu';
import LoadingDots from '../LoadingDots';
import MessageActions from '../MessageActions';
import UserContextMenu from '../UserContextMenu';
import ErrorContent from './ErrorContent';
import { useStyles } from './style';

interface ChatBubbleProps {
  isLoading?: boolean;
  message: ChatMessage;
  showActions?: boolean;
  showTime?: boolean;
  showTitle?: boolean;
}

const ChatBubble = memo(
  ({ message, isLoading, showActions = true, showTime = true, showTitle }: ChatBubbleProps) => {
    const isUser = message.role === 'user';
    const hasError = !!message.error;

    const { styles, theme } = useStyles();
    const { fontSize } = useSettingStore();

    const content = useMemo(() => {
      if (hasError && message.error?.type) {
        return <ErrorContent error={message.error} />;
      }

      if (isLoading) {
        return (
          <View style={styles.loadingDotsContainer}>
            <LoadingDots />
          </View>
        );
      }

      return <Markdown fontSize={fontSize}>{message.content}</Markdown>;
    }, [fontSize, hasError, isLoading, message.content, message.error]);

    const AssistantMessage = (
      <Block style={[hasError && styles.errorBubble]} variant={'borderless'}>
        {content}
      </Block>
    );

    const UserMessage = (
      <Block style={[hasError && styles.errorBubble]} variant={'borderless'}>
        {content}
      </Block>
    );

    return (
      <Flexbox gap={12} horizontal paddingBlock={8}>
        <Avatar avatar={message?.meta?.avatar || DEFAULT_AVATAR} size={32} />
        <Flexbox flex={1} gap={4}>
          <Flexbox align={'center'} gap={8} horizontal>
            {showTitle && message?.meta?.title && (
              <Text color={!isUser ? theme.geekblue : theme.colorWarning} fontSize={13} strong>
                {message?.meta?.title}
              </Text>
            )}
            {showTime && message?.createdAt && (
              <Text fontSize={12} type={'secondary'}>
                {formatTime(message.createdAt)}
              </Text>
            )}
          </Flexbox>
          {!isUser ? (
            <Flexbox gap={4}>
              {showActions ? (
                <AssistantMenu message={message}>{AssistantMessage}</AssistantMenu>
              ) : (
                AssistantMessage
              )}
              {showActions && !isLoading && (message.content || hasError) && (
                <MessageActions message={message} />
              )}
            </Flexbox>
          ) : showActions ? (
            <UserContextMenu message={message}>{UserMessage}</UserContextMenu>
          ) : (
            UserMessage
          )}
        </Flexbox>
      </Flexbox>
    );
  },
);

ChatBubble.displayName = 'ChatBubble';

export default ChatBubble;
