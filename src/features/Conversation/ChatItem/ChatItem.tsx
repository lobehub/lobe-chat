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
    renderMessage,
    errorMessage,
    onDoubleClick,
    aboveMessage,
    belowMessage,
    markdownProps,
    showAvatar = true,
    titleAddon,
    disabled = false,
    id,
    style,
    ...rest
  }) => {
    const { cx, styles } = useStyles({
      disabled,
      placement,
    });

    const isUser = placement === 'right';
    return (
      <Flexbox
        className={cx(styles.container, className)}
        gap={8}
        paddingBlock={16}
        style={{
          paddingInlineStart: isUser ? 36 : 0,
          ...style,
        }}
        {...rest}
      >
        <Flexbox align={'center'} direction={isUser ? 'horizontal-reverse' : 'horizontal'} gap={8}>
          {showAvatar && (
            <Avatar
              addon={avatarAddon}
              alt={avatarProps?.alt || avatar.title || 'avatar'}
              loading={loading}
              onClick={onAvatarClick}
              placement={placement}
              {...avatarProps}
              avatar={avatar}
            />
          )}
          <Title avatar={avatar} showTitle={showTitle} time={time} titleAddon={titleAddon} />
        </Flexbox>
        {aboveMessage}
        {error && (message === placeholderMessage || !message) ? (
          <ErrorContent error={error} message={errorMessage} />
        ) : (
          <MessageContent
            disabled={disabled}
            editing={editing}
            id={id!}
            markdownProps={markdownProps}
            message={message}
            messageExtra={
              <>
                {error && <ErrorContent error={error} message={errorMessage} />}
                {messageExtra}
              </>
            }
            onDoubleClick={onDoubleClick}
            renderMessage={renderMessage}
            variant={isUser ? 'bubble' : undefined}
          />
        )}
        {actions && <Actions actions={actions} />}
        {belowMessage}
      </Flexbox>
    );
  },
);

export default ChatItem;
