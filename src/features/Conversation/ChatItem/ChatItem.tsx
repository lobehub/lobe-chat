'use client';

import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import Actions from './components/Actions';
import Avatar from './components/Avatar';
import ErrorContent from './components/ErrorContent';
import MessageContent from './components/MessageContent';
import Title from './components/Title';
import { useStyles } from './style';
import { ChatItemProps } from './type';

const ChatItem = memo<ChatItemProps>(
  ({
    avatarAddon,
    onAvatarClick,
    avatarProps,
    actions,
    className,
    loading,
    message,
    placeholderMessage = '...',
    placement = 'left',
    avatar,
    error,
    showTitle,
    time,
    editing,
    messageExtra,
    children,
    errorMessage,
    onDoubleClick,
    aboveMessage,
    belowMessage,
    showAvatar = true,
    titleAddon,
    disabled = false,
    id,
    style,
    newScreen,
    ...rest
  }) => {
    const { cx, styles } = useStyles({
      disabled,
      placement,
    });

    const isUser = placement === 'right';
    const isEmptyMessage =
      !message || String(message).trim() === '' || message === placeholderMessage;
    const errorContent = <ErrorContent error={error} message={errorMessage} />;

    return (
      <Flexbox
        align={isUser ? 'flex-end' : 'flex-start'}
        className={cx(
          'message-wrapper',
          styles.container,
          newScreen && styles.newScreen,
          className,
        )}
        gap={8}
        paddingBlock={8}
        style={{
          paddingInlineStart: isUser ? 36 : 0,
          ...style,
        }}
        {...rest}
      >
        <Flexbox
          align={'center'}
          className={'message-header'}
          direction={isUser ? 'horizontal-reverse' : 'horizontal'}
          gap={8}
        >
          {showAvatar && (
            <Avatar
              addon={avatarAddon}
              alt={avatarProps?.alt || avatar.title || 'avatar'}
              loading={loading}
              onClick={onAvatarClick}
              placement={placement}
              shape={'square'}
              {...avatarProps}
              avatar={avatar}
            />
          )}
          <Title avatar={avatar} showTitle={showTitle} time={time} titleAddon={titleAddon} />
        </Flexbox>
        <Flexbox
          className={'message-body'}
          gap={8}
          style={{
            maxWidth: '100%',
            overflow: 'hidden',
            position: 'relative',
            width: isUser ? undefined : '100%',
          }}
        >
          {aboveMessage}
          {error && isEmptyMessage ? (
            errorContent
          ) : (
            <MessageContent
              disabled={disabled}
              editing={editing}
              id={id!}
              message={message}
              messageExtra={
                <>
                  {error && <ErrorContent error={error} message={errorMessage} />}
                  {messageExtra}
                </>
              }
              onDoubleClick={onDoubleClick}
              variant={isUser ? 'bubble' : undefined}
            >
              {children}
            </MessageContent>
          )}
          {belowMessage}
        </Flexbox>
        {actions && <Actions actions={actions} placement={placement} />}
      </Flexbox>
    );
  },
);

export default ChatItem;
