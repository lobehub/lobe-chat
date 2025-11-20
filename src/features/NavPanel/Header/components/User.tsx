'use client';

import { Block, Icon, Text } from '@lobehub/ui';
import { createStyles, useTheme } from 'antd-style';
import { ChevronDownIcon } from 'lucide-react';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { ProductLogo } from '@/components/Branding';
import { BRANDING_NAME } from '@/const/branding';
import UserAvatar from '@/features/User/UserAvatar';
import UserPanel from '@/features/User/UserPanel';
import { useGlobalStore } from '@/store/global';
import { systemStatusSelectors } from '@/store/global/selectors';
import { useUserStore } from '@/store/user';
import { authSelectors, userProfileSelectors } from '@/store/user/selectors';

export const USER_DROPDOWN_ICON_ID = 'user-dropdown-icon';

const useStyles = createStyles(({ css, token }) => ({
  base: css`
    overflow: hidden;
    transition:
      width,
      opacity 200ms ${token.motionEaseInOut};
  `,
  hide: css`
    pointer-events: none;
    width: 0;
    opacity: 0;
  `,
}));

const User = memo<{ expand?: boolean }>(() => {
  const expand = useGlobalStore(systemStatusSelectors.showSessionPanel);
  const { cx, styles } = useStyles();
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
          minWidth: 32,
          overflow: 'hidden',
          paddingInlineEnd: expand ? 8 : 2,
          paddingInlineStart: 2,
        }}
        variant={'borderless'}
      >
        <UserAvatar shape={'square'} size={28} />
        <Flexbox
          align={'center'}
          className={cx(styles.base, !expand && styles.hide)}
          gap={4}
          horizontal
        >
          {!isSignedIn ? (
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
        </Flexbox>
      </Block>
    </UserPanel>
  );
});

export default User;
