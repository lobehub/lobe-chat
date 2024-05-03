import { memo } from 'react';

import UserAvatar from '@/features/User/UserAvatar';
import UserPanel from '@/features/User/UserPanel';

const Avatar = memo(() => {
  return (
    <UserPanel>
      <UserAvatar clickable />
    </UserPanel>
  );
});

Avatar.displayName = 'Avatar';

export default Avatar;
