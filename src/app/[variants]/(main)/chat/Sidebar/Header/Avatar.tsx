'use client';

import { Avatar, GroupAvatar } from '@lobehub/ui';
import { Skeleton } from 'antd';
import { memo } from 'react';

import { DEFAULT_AVATAR } from '@/const/meta';
import { useOpenChatSettings } from '@/hooks/useInterceptingRoutes';
import { useSessionStore } from '@/store/session';
import { sessionMetaSelectors, sessionSelectors } from '@/store/session/selectors';
import { useUserStore } from '@/store/user';
import { userProfileSelectors } from '@/store/user/selectors';
import { GroupMemberWithAgent } from '@/types/session';

const HeaderAvatar = memo<{ size?: number }>(({ size = 28 }) => {
  const [init, title, avatar, backgroundColor, members, sessionType] = useSessionStore((s) => {
    const session = sessionSelectors.currentSession(s);

    return [
      sessionSelectors.isSomeSessionActive(s),
      sessionMetaSelectors.currentAgentTitle(s),
      sessionMetaSelectors.currentAgentAvatar(s),
      sessionMetaSelectors.currentAgentBackgroundColor(s),
      session?.type === 'group' ? session.members : undefined,
      session?.type,
    ];
  });

  const currentUser = useUserStore((s) => ({
    avatar: userProfileSelectors.userAvatar(s),
    name: userProfileSelectors.displayUserName(s) || userProfileSelectors.nickName(s) || 'You',
  }));

  const isGroup = sessionType === 'group';

  const openChatSettings = useOpenChatSettings();

  if (!init) return <Skeleton.Avatar active shape={'circle'} size={size} />;

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
        onClick={() => openChatSettings()}
        size={size}
        title={title}
      />
    );
  }

  return (
    <Avatar
      avatar={avatar}
      background={backgroundColor}
      onClick={() => openChatSettings()}
      shape={'circle'}
      size={size}
      title={title}
    />
  );
});

export default HeaderAvatar;
