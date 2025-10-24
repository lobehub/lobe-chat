import { ChatMessage } from '@lobechat/types';
import { Avatar, Block, Flexbox, Markdown, Text } from '@lobehub/ui-rn';
import { memo, useMemo } from 'react';

import { DEFAULT_AVATAR } from '@/_const/meta';
import MessageContextMenu from '@/features/chat/MessageContextMenu';
import { useSettingStore } from '@/store/setting';
import { formatTime } from '@/utils/formatTime';

import LoadingDots from '../LoadingDots';
import MessageActions from '../MessageActions';
import ErrorContent from './ErrorContent';
import { useStyles } from './style';

interface ChatBubbleProps {
  isLoading?: boolean;
  message: ChatMessage;
  showActions?: boolean;
  showActionsBar?: boolean;
  showTime?: boolean;
  showTitle?: boolean;
}

const ChatBubble = memo(
  ({
    message,
    isLoading,
    showActions = true,
    showTime = true,
    showTitle = true,
    showActionsBar,
  }: ChatBubbleProps) => {
    const isUser = message.role === 'user';
    const hasError = !!message.error;

    const { styles } = useStyles();
    const { fontSize } = useSettingStore();

    const content = useMemo(() => {
      if (hasError && message.error?.type) {
        return <ErrorContent error={message.error} />;
      }

      if (isLoading) {
        return <LoadingDots />;
      }

      return <Markdown fontSize={fontSize}>{message.content}</Markdown>;
    }, [fontSize, hasError, isLoading, message.content, message.error]);

    const node = (
      <>
        {!isUser && (
          <Flexbox align={'center'} gap={8} horizontal>
            <Avatar
              avatar={message?.meta?.avatar || DEFAULT_AVATAR}
              backgroundColor={message?.meta?.backgroundColor}
              size={24}
            />
            {showTitle && message?.meta?.title && <Text weight={500}>{message?.meta?.title}</Text>}
            {showTime && message?.createdAt && (
              <Text fontSize={12} type={'secondary'}>
                {formatTime(message.createdAt)}
              </Text>
            )}
          </Flexbox>
        )}
        <Flexbox style={{ paddingBottom: 16 }}>
          {isUser ? (
            <Flexbox horizontal justify={'flex-end'}>
              <Block
                style={[isUser && styles.userBubble, hasError && styles.errorBubble]}
                variant={isUser ? 'outlined' : 'borderless'}
              >
                {content}
              </Block>
            </Flexbox>
          ) : (
            <Flexbox gap={4}>
              <Block style={[hasError && styles.errorBubble]} variant={'borderless'}>
                {content}
              </Block>
              {showActions && showActionsBar && !isLoading && (message.content || hasError) && (
                <MessageActions message={message} />
              )}
            </Flexbox>
          )}
        </Flexbox>
      </>
    );

    if (showActions)
      return (
        <MessageContextMenu
          borderRadius={false}
          gap={8}
          message={message}
          paddingBlock={8}
          paddingInline={16}
        >
          {node}
        </MessageContextMenu>
      );

    return (
      <Flexbox gap={8} paddingBlock={8} paddingInline={16}>
        {node}
      </Flexbox>
    );
  },
);

ChatBubble.displayName = 'ChatBubble';

export default ChatBubble;
