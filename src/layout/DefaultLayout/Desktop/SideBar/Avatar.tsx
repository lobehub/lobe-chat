import { UserButton, useUser } from '@clerk/nextjs';
import Image from 'next/image';
import { memo } from 'react';

import { DEFAULT_USER_AVATAR_URL } from '@/const/meta';

const Avatar = memo(() => {
  const { isSignedIn, isLoaded } = useUser();

  console.log(isLoaded);
  return isSignedIn ? (
    <UserButton
      appearance={{
        elements: {
          avatarBox: { height: 40, width: 40 },
        },
      }}
    />
  ) : (
    <Image alt={'LobeChat'} height={40} src={DEFAULT_USER_AVATAR_URL} unoptimized width={40} />
  );
});

Avatar.displayName = 'Avatar';

export default Avatar;
