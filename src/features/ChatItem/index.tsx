'use client';

import { ChatItemProps, ChatItem as ChatItemRaw } from '@lobehub/ui/chat';
import isEqual from 'fast-deep-equal';
import { memo, useMemo } from 'react';

import { isDesktop } from '@/const/version';
import { useElectronStore } from '@/store/electron';
import { electronSyncSelectors } from '@/store/electron/selectors';
import { useUserStore } from '@/store/user';
import { settingsSelectors } from '@/store/user/selectors';

const ChatItem = memo<ChatItemProps>(({ markdownProps = {}, avatar, ...rest }) => {
  const { componentProps, ...restMarkdown } = markdownProps;
  const { general } = useUserStore(settingsSelectors.currentSettings, isEqual);

  const remoteServerUrl = useElectronStore(electronSyncSelectors.remoteServerUrl);
  const processedAvatar = useMemo(() => {
    // only process avatar in desktop environment and when avatar url starts with /
    if (
      !isDesktop ||
      !remoteServerUrl ||
      !avatar.avatar ||
      typeof avatar.avatar !== 'string' ||
      !avatar.avatar.startsWith('/')
    )
      return avatar;

    return {
      ...avatar,
      avatar: remoteServerUrl + avatar.avatar, // prepend the remote server URL
    };
  }, [avatar, remoteServerUrl]);

  return (
    <ChatItemRaw
      avatar={processedAvatar}
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
