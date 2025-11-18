'use client';

import { Block, Text } from '@lobehub/ui';
import { memo } from 'react';

import { BRANDING_NAME } from '@/const/branding';
import UserAvatar from '@/features/User/UserAvatar';
import UserPanel from '@/features/User/UserPanel';
import { useUserStore } from '@/store/user';
import { userProfileSelectors } from '@/store/user/selectors';

interface UserProps {
  expand: boolean;
}

const User = memo<UserProps>(({ expand }) => {
  const [nickname, username] = useUserStore((s) => [
    userProfileSelectors.nickName(s),
    userProfileSelectors.username(s),
  ]);
  return (
    <UserPanel>
      <Block
        align={'center'}
        clickable
        gap={8}
        horizontal
        paddingBlock={2}
        style={{
          overflow: 'hidden',
          paddingInlineEnd: expand ? 8 : 2,
          paddingInlineStart: 2,
        }}
        variant={'borderless'}
      >
        <UserAvatar shape={'square'} size={28} />
        {expand && (
          <Text
            ellipsis
            style={{
              flex: 1,
            }}
            weight={500}
          >
            {nickname || username || BRANDING_NAME}
          </Text>
        )}
      </Block>
    </UserPanel>
  );
});

export default User;
