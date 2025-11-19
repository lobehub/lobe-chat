'use client';

import { Block, Icon, Text } from '@lobehub/ui';
import { useTheme } from 'antd-style';
import { ChevronDownIcon } from 'lucide-react';
import { memo } from 'react';

import { ProductLogo } from '@/components/Branding';
import { BRANDING_NAME } from '@/const/branding';
import UserAvatar from '@/features/User/UserAvatar';
import UserPanel from '@/features/User/UserPanel';
import { useGlobalStore } from '@/store/global';
import { systemStatusSelectors } from '@/store/global/selectors';
import { useUserStore } from '@/store/user';
import { authSelectors, userProfileSelectors } from '@/store/user/selectors';

export const USER_DROPDOWN_ICON_ID = 'user-dropdown-icon';

const User = memo(() => {
  const expand = useGlobalStore(systemStatusSelectors.showSessionPanel);
  const [nickname, username, isSignedIn] = useUserStore((s) => [
    userProfileSelectors.nickName(s),
    userProfileSelectors.username(s),
    authSelectors.isLogin(s),
  ]);
  const theme = useTheme();
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
        {expand && !isSignedIn ? (
          <ProductLogo color={theme.colorText} size={28} type={'text'} />
        ) : (
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
        <Icon
          color={theme.colorTextDescription}
          icon={ChevronDownIcon}
          id={USER_DROPDOWN_ICON_ID}
        />
      </Block>
    </UserPanel>
  );
});

export default User;
