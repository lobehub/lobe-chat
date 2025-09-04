'use client';

import { useResponsive } from 'antd-style';
import { memo, useEffect, useRef, useState } from 'react';
import { Flexbox } from 'react-layout-kit';

import Actions from './components/Actions';
import Avatar from './components/Avatar';
import BorderSpacing from './components/BorderSpacing';
import ErrorContent from './components/ErrorContent';
import MessageContent from './components/MessageContent';
import Title from './components/Title';
import { useStyles } from './style';
import type { ChatItemProps } from './type';

const MOBILE_AVATAR_SIZE = 32;

const ChatItem = memo<ChatItemProps>(
  ({
    avatarAddon,
    onAvatarClick,
    avatarProps,
    actions,
    className,
    primary,
    loading,
    message,
    placeholderMessage = '...',
    placement = 'left',
    variant = 'bubble',
    avatar,
    error,
    showTitle,
    time,
    editing,
    onChange,
    onEditingChange,
    messageExtra,
    renderMessage,
    text,
    errorMessage,
    onDoubleClick,
    fontSize,
    aboveMessage,
    belowMessage,
    markdownProps,
    actionsWrapWidth = 54,
    ...rest
  }) => {
    const { mobile } = useResponsive();
    const { cx, styles } = useStyles({
      editing,
      placement,
      primary,
      showTitle,
      time,
      title: avatar.title,
      variant,
    });

    // 在 ChatItem 组件中添加
    const contentRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [layoutMode, setLayoutMode] = useState<'horizontal' | 'vertical'>(
      variant === 'bubble' ? 'horizontal' : 'vertical',
    );

    // 使用 ResizeObserver 监控内容和容器尺寸
    useEffect(() => {
      if (variant === 'docs') {
        setLayoutMode('vertical');
        return;
      }

      if (!contentRef.current || !containerRef.current) return;

      const observer = new ResizeObserver(() => {
        if (!contentRef.current || !containerRef.current) return;

        const containerWidth = containerRef.current.clientWidth;
        const contentWidth = contentRef.current.scrollWidth; // 使用scrollWidth获取实际内容宽度

        // 预留给Actions的最小空间 (根据实际Actions大小调整)

        // 只有当内容宽度 + Actions最小宽度 > 容器宽度时才切换布局
        setLayoutMode(contentWidth + actionsWrapWidth > containerWidth ? 'vertical' : 'horizontal');
      });

      observer.observe(contentRef.current);
      observer.observe(containerRef.current);

      return () => observer.disconnect();
    }, [variant, actionsWrapWidth]);

    return (
      <Flexbox
        className={cx(styles.container, className)}
        direction={placement === 'left' ? 'horizontal' : 'horizontal-reverse'}
        gap={mobile ? 6 : 12}
        {...rest}
      >
        <Avatar
          {...avatarProps}
          addon={avatarAddon}
          alt={avatarProps?.alt || avatar.title || 'avatar'}
          avatar={avatar}
          loading={loading}
          onClick={onAvatarClick}
          placement={placement}
          size={mobile ? MOBILE_AVATAR_SIZE : undefined}
          style={{
            marginTop: 6,
            ...avatarProps?.style,
          }}
        />
        <Flexbox
          align={placement === 'left' ? 'flex-start' : 'flex-end'}
          className={styles.messageContainer}
          ref={containerRef}
        >
          <Title avatar={avatar} placement={placement} showTitle={showTitle} time={time} />
          {aboveMessage}
          <Flexbox
            align={placement === 'left' ? 'flex-start' : 'flex-end'}
            className={styles.messageContent}
            data-layout={layoutMode} // 添加数据属性以方便样式选择
            direction={
              layoutMode === 'horizontal'
                ? placement === 'left'
                  ? 'horizontal'
                  : 'horizontal-reverse'
                : 'vertical'
            }
            gap={8}
          >
            <Flexbox ref={contentRef} width={'100%'}>
              {error && (message === placeholderMessage || !message) ? (
                <ErrorContent error={error} message={errorMessage} placement={placement} />
              ) : (
                <MessageContent
                  editing={editing}
                  fontSize={fontSize}
                  markdownProps={markdownProps}
                  message={message}
                  messageExtra={
                    <>
                      {error && (
                        <ErrorContent error={error} message={errorMessage} placement={placement} />
                      )}
                      {messageExtra}
                    </>
                  }
                  onChange={onChange}
                  onDoubleClick={onDoubleClick}
                  onEditingChange={onEditingChange}
                  placement={placement}
                  primary={primary}
                  renderMessage={renderMessage}
                  text={text}
                  variant={variant}
                />
              )}
            </Flexbox>
            {actions && (
              <Actions
                actions={actions}
                editing={editing}
                placement={placement}
                variant={variant}
              />
            )}
          </Flexbox>
          {belowMessage}
        </Flexbox>
        {mobile && variant === 'bubble' && <BorderSpacing borderSpacing={MOBILE_AVATAR_SIZE} />}
      </Flexbox>
    );
  },
);

export default ChatItem;

export type { ChatItemProps } from './type';
