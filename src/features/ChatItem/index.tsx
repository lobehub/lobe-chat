'use client';

import { ChatItemProps, ChatItem as ChatItemRaw } from '@lobehub/ui/chat';
import isEqual from 'fast-deep-equal';
import { memo } from 'react';

import { useUserStore } from '@/store/user';
import { settingsSelectors } from '@/store/user/selectors';

const ChatItem = memo<ChatItemProps>(({ markdownProps = {}, ...rest }) => {
  const { componentProps, ...restMarkdown } = markdownProps;
  const { general } = useUserStore(settingsSelectors.currentSettings, isEqual);
  return (
    <ChatItemRaw
      fontSize={general.fontSize}
      markdownProps={{
        ...restMarkdown,
        componentProps: {
          ...componentProps,
          highlight: {
            theme: general.highlighterTheme,
            ...componentProps?.highlight,
          },
          mermaid: {
            theme: general.mermaidTheme,
            ...componentProps?.mermaid,
          },
        },
      }}
      {...rest}
    />
  );
});

export default ChatItem;
