'use client';

import { Avatar, GroupAvatar } from '@lobehub/ui';
import { memo } from 'react';

import { DEFAULT_AVATAR } from '@/const/meta';
import { useAgentStore } from '@/store/agent';
import { agentSelectors } from '@/store/agent/selectors';
import { useSessionStore } from '@/store/session';
import { sessionSelectors } from '@/store/session/selectors';
import { useUserStore } from '@/store/user';
import { userProfileSelectors } from '@/store/user/selectors';
import { GroupMemberWithAgent } from '@/types/session';

const HeaderAvatar = memo<{ size?: number }>(({ size = 28 }) => {
  const [avatar, backgroundColor] = useAgentStore((s) => [
    agentSelectors.currentAgentAvatar(s),
    agentSelectors.currentAgentBackgroundColor(s),
  ]);

  const [members, sessionType] = useSessionStore((s) => {
    const session = sessionSelectors.currentSession(s);
    return [session?.type === 'group' ? session.members : undefined, session?.type];
  });

  const currentUser = useUserStore((s) => ({
    avatar: userProfileSelectors.userAvatar(s),
    name: userProfileSelectors.displayUserName(s) || userProfileSelectors.nickName(s) || 'You',
  }));

  const isGroup = sessionType === 'group';

  if (isGroup) {
    return (
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
        size={size}
      />
    );
  }

  return (
    <Avatar avatar={avatar} background={backgroundColor || undefined} shape={'circle'} size={size} />
  );
});

export default HeaderAvatar;
