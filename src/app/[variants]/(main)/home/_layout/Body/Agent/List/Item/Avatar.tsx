import { Avatar, GroupAvatar } from '@lobehub/ui';
import { memo } from 'react';

const AgentAvatar = memo<{
  avatar: string | { avatar: string; background?: string }[];
  avatarBackground?: string;
  type?: 'agent' | 'group' | 'inbox';
}>(({ avatar, avatarBackground, type }) => {
  if (type === 'group') {
    return (
      <GroupAvatar
        avatarShape={'square'}
        avatars={Array.isArray(avatar) ? avatar : [avatar]}
        cornerShape={'square'}
        size={28}
      />
    );
  }

  return (
    <Avatar
      avatar={Array.isArray(avatar) ? avatar[0]?.avatar : avatar}
      background={avatarBackground}
      shape={'square'}
      size={28}
    />
  );
});

export default AgentAvatar;
