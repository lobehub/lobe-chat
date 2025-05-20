'use client';

import { ChatItemProps, ChatItem as ChatItemRaw } from '@lobehub/ui/chat';
import isEqual from 'fast-deep-equal';
import { memo } from 'react';

import { useGlobalStore } from '@/store/global';
import { systemStatusSelectors } from '@/store/global/selectors';
import { useUserStore } from '@/store/user';
import { settingsSelectors } from '@/store/user/selectors';

const ChatItem = memo<ChatItemProps>(({ markdownProps = {}, ...rest }) => {
  const { componentProps, ...restMarkdown } = markdownProps;
  const { general } = useUserStore(settingsSelectors.currentSettings, isEqual);
  const themeMode = useGlobalStore(systemStatusSelectors.themeMode);
  return (
    <ChatItemRaw
      fontSize={general.fontSize}
      markdownProps={{
        ...restMarkdown,
        componentProps: {
          ...componentProps,
          highlight: {
            theme:
              themeMode === 'light' ? general.highlighterLightTheme : general.highlighterDarkTheme,
            ...componentProps?.highlight,
          },
          mermaid: {
            theme: themeMode === 'dark' ? general.mermaidDarkTheme : general.mermaidLightTheme,
            ...componentProps?.mermaid,
          },
        },
      }}
      {...rest}
    />
  );
});

export default ChatItem;
