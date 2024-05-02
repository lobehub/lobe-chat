'use client';

import { Avatar, type AvatarProps } from '@lobehub/ui';
import { memo } from 'react';

import { DEFAULT_USER_AVATAR_URL } from '@/const/meta';
import { useUserStore } from '@/store/user';
import { commonSelectors } from '@/store/user/selectors';

const UserAvatar = memo<AvatarProps>(({ size = 40, background, ...rest }) => {
  const avatar = useUserStore(commonSelectors.userAvatar);
  return (
    <Avatar
      avatar={avatar || DEFAULT_USER_AVATAR_URL}
      background={avatar ? background : undefined}
      size={size}
      {...rest}
    />
  );
});

UserAvatar.displayName = 'UserAvatar';

export default UserAvatar;
