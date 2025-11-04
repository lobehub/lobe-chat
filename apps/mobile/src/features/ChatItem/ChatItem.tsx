import { Block, Flexbox, Text } from '@lobehub/ui-rn';
import { memo, useMemo } from 'react';

import MessageContextMenu from '@/features/Conversation/components/MessageContextMenu';
import { formatTime } from '@/utils/formatTime';

import Actions from './components/Actions';
import Avatar from './components/Avatar';
import ErrorContent from './components/ErrorContent';
import MessageContent from './components/MessageContent';
import { useStyles } from './style';
import { ChatItemProps } from './type';

const ChatItem = memo<ChatItemProps>(
  ({
    message,
    isLoading,
    showActions = true,
    showTime = true,
    showTitle = true,
    showActionsBar,
    markdownProps,
  }) => {
    const isUser = message.role === 'user';
    const hasError = !!message.error;

    const { styles, theme } = useStyles();

    const content = useMemo(() => {
      if (hasError && message.error?.type) {
        return <ErrorContent error={message.error} />;
      }

      return (
        <MessageContent
          content={message.content}
          isLoading={isLoading}
          markdownProps={markdownProps}
        />
      );
    }, [hasError, isLoading, message.content, message.error, markdownProps]);

    const node = (
      <>
        {!isUser && (
          <Flexbox align={'center'} gap={8} horizontal>
            <Avatar
              avatar={message?.meta?.avatar}
              backgroundColor={message?.meta?.backgroundColor}
              size={24}
              title={message?.meta?.title}
            />
            {showTitle && message?.meta?.title && <Text weight={500}>{message?.meta?.title}</Text>}
            {showTime && message?.createdAt && (
              <Text color={theme.colorTextQuaternary} fontSize={11}>
                {formatTime(message.createdAt)}
              </Text>
            )}
          </Flexbox>
        )}
        <Flexbox>
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
                <Actions message={message} />
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

ChatItem.displayName = 'ChatItem';

export default ChatItem;
