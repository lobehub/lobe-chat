import { Avatar as AvatarComponent } from '@lobehub/ui-rn';
import { memo } from 'react';

import { DEFAULT_AVATAR } from '@/_const/meta';

interface AvatarProps {
  avatar?: string;
  backgroundColor?: string;
  size?: number;
  title?: string;
}

const Avatar = memo<AvatarProps>(({ avatar, backgroundColor, size = 24, title }) => {
  return (
    <AvatarComponent
      avatar={avatar || DEFAULT_AVATAR}
      backgroundColor={backgroundColor}
      size={size}
      title={title}
    />
  );
});

Avatar.displayName = 'Avatar';

export default Avatar;
