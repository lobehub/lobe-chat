'use client';

import { Avatar, Block } from '@lobehub/ui';
import { memo } from 'react';

import { useOpenChatSettings } from '@/hooks/useInterceptingRoutes';
import { useSessionStore } from '@/store/session';
import { sessionMetaSelectors } from '@/store/session/selectors';

const HeaderAvatar = memo(() => {
  const [avatar, backgroundColor] = useSessionStore((s) => {
    return [
      sessionMetaSelectors.currentAgentAvatar(s),
      sessionMetaSelectors.currentAgentBackgroundColor(s),
    ];
  });

  const openChatSettings = useOpenChatSettings();

  return (
    <Block
      clickable
      flex={'none'}
      height={32}
      onClick={(e) => {
        e.stopPropagation();
        openChatSettings();
      }}
      padding={2}
      style={{
        overflow: 'hidden',
      }}
      variant={'borderless'}
      width={32}
    >
      <Avatar avatar={avatar} background={backgroundColor} shape={'circle'} size={28} />
    </Block>
  );
});

export default HeaderAvatar;
