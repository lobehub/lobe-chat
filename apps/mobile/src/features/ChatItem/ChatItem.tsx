import { Block, Flexbox, Text } from '@lobehub/ui-rn';
import { memo } from 'react';

import { formatTime } from '@/utils/formatTime';

import Avatar from './components/Avatar';
import ErrorContent from './components/ErrorContent';
import MessageContent from './components/MessageContent';
import { useStyles } from './style';
import { ChatItemProps } from './type';

/**
 * ChatItem - 通用的消息展示组件
 *
 * 这是一个纯展示组件，不关心消息角色（user/assistant/supervisor）
 * 提供统一的布局结构，由角色组件（User/Assistant/Supervisor）调用
 */
const ChatItem = memo<ChatItemProps>(
  ({
    avatar,
    placement = 'left',
    loading,
    message,
    error,
    showTitle = true,
    showTime = true,
    time,
    actions,
    messageExtra,
    renderMessage,
    markdownProps,
    aboveMessage,
    belowMessage,
    errorMessage,
  }) => {
    const { styles, theme } = useStyles();

    // 默认内容渲染 - 对齐 web 端逻辑
    const defaultContent =
      error && (message === '...' || !message) ? (
        // 如果有 error 且没有 message 内容，完全用 ErrorContent 替代
        <ErrorContent error={error} message={errorMessage} />
      ) : (
        // 否则渲染 MessageContent，并在 messageExtra 中显示 ErrorContent
        <MessageContent
          content={message || ''}
          isLoading={loading}
          markdownProps={markdownProps}
          messageExtra={
            <>
              {error && <ErrorContent error={error} message={errorMessage} />}
              {messageExtra}
            </>
          }
        />
      );

    // 使用 renderMessage 自定义渲染，或使用默认渲染
    const content = renderMessage ? renderMessage(defaultContent) : defaultContent;

    return (
      <Flexbox gap={8}>
        {/* 上方额外内容 */}
        {aboveMessage}

        {/* 头像和标题行 - 只在 showTitle 或 showTime 为 true 时显示 */}
        {(showTitle || showTime) &&
          (placement === 'left' ? (
            <Flexbox align={'center'} gap={8} horizontal>
              {showTitle && (
                <Avatar
                  avatar={avatar.avatar}
                  backgroundColor={avatar.backgroundColor}
                  size={24}
                  title={avatar.title}
                />
              )}
              {showTitle && avatar.title && <Text weight={500}>{avatar.title}</Text>}
              {showTime && time && (
                <Text color={theme.colorTextQuaternary} fontSize={11}>
                  {formatTime(time)}
                </Text>
              )}
            </Flexbox>
          ) : (
            <Flexbox align={'center'} gap={8} horizontal justify={'flex-end'}>
              {showTime && time && (
                <Text color={theme.colorTextQuaternary} fontSize={11}>
                  {formatTime(time)}
                </Text>
              )}
              {showTitle && avatar.title && <Text weight={500}>{avatar.title}</Text>}
              {showTitle && (
                <Avatar
                  avatar={avatar.avatar}
                  backgroundColor={avatar.backgroundColor}
                  size={24}
                  title={avatar.title}
                />
              )}
            </Flexbox>
          ))}

        {/* 消息内容 */}
        <Flexbox
          horizontal={placement === 'right'}
          justify={placement === 'right' ? 'flex-end' : 'flex-start'}
        >
          <Flexbox gap={4}>
            <Block
              borderRadius={placement === 'right'}
              style={placement === 'right' && styles.userBubble}
              variant={placement === 'right' ? 'outlined' : 'borderless'}
            >
              {content}
              {messageExtra && <Flexbox style={{ marginTop: 8 }}>{messageExtra}</Flexbox>}
            </Block>
            {actions}
          </Flexbox>
        </Flexbox>

        {/* 下方额外内容 */}
        {belowMessage}
      </Flexbox>
    );
  },
);

ChatItem.displayName = 'ChatItem';

export default ChatItem;
