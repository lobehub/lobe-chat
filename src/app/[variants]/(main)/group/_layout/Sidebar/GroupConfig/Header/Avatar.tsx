'use client';

import { Block, GroupAvatar } from '@lobehub/ui';
import { memo } from 'react';

import { DEFAULT_AVATAR } from '@/const/meta';
import { useOpenChatSettings } from '@/hooks/useInterceptingRoutes';
import { useAgentGroupStore } from '@/store/agentGroup';
import { agentGroupSelectors } from '@/store/agentGroup/selectors';
import { useUserStore } from '@/store/user';
import { userProfileSelectors } from '@/store/user/selectors';

const HeaderAvatar = memo<{ size?: number }>(() => {
  const groupMeta = useAgentGroupStore(agentGroupSelectors.currentGroupMeta);
  const currentGroup = useAgentGroupStore(agentGroupSelectors.currentGroup);
  const agents = currentGroup?.agents || [];

  const currentUser = useUserStore((s) => ({
    avatar: userProfileSelectors.userAvatar(s),
    name: userProfileSelectors.displayUserName(s) || userProfileSelectors.nickName(s) || 'You',
  }));

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
      <GroupAvatar
        avatarShape={'square'}
        avatars={[
          {
            avatar: currentUser.avatar || DEFAULT_AVATAR,
          },
          ...agents.map((agent) => ({
            avatar: agent.avatar || DEFAULT_AVATAR,
            background: agent.backgroundColor || undefined,
          })),
        ]}
        cornerShape={'square'}
        size={28}
        title={groupMeta.title || undefined}
      />
    </Block>
  );
});

export default HeaderAvatar;
