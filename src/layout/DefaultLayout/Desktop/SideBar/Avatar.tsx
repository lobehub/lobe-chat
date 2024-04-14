import { memo } from 'react';

import AvatarWithUpload from '@/features/AvatarWithUpload';

const Avatar = memo(() => {
  return <AvatarWithUpload id={'avatar'} />;
});

Avatar.displayName = 'Avatar';

export default Avatar;
