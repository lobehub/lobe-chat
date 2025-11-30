'use client';

import { Block, GroupAvatar } from '@lobehub/ui';
import { memo } from 'react';

import { DEFAULT_AVATAR } from '@/const/meta';
import { useOpenChatSettings } from '@/hooks/useInterceptingRoutes';
import { useAgentStore } from '@/store/agent';
import { agentSelectors } from '@/store/agent/selectors';
import { useSessionStore } from '@/store/session';
import { sessionSelectors } from '@/store/session/selectors';
import { useUserStore } from '@/store/user';
import { userProfileSelectors } from '@/store/user/selectors';
import { GroupMemberWithAgent } from '@/types/session';

const HeaderAvatar = memo<{ size?: number }>(() => {
  const title = useAgentStore(agentSelectors.currentAgentTitle);
  const members = useSessionStore((s) => {
    const session = sessionSelectors.currentSession(s);
    return session?.type === 'group' ? session.members : undefined;
  });

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
          ...(members?.map((member: GroupMemberWithAgent) => ({
            avatar: member.avatar || DEFAULT_AVATAR,
            background: member.backgroundColor || undefined,
          })) || []),
        ]}
        cornerShape={'square'}
        size={28}
        title={title ?? undefined}
      />
    </Block>
  );
});

export default HeaderAvatar;
