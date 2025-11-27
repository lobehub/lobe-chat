'use client';

import { Text } from '@lobehub/ui';
import { useTheme } from 'antd-style';
import { memo } from 'react';
import { Flexbox, FlexboxProps } from 'react-layout-kit';

import PlanTag from '@/features/User/PlanTag';
import { useUserStore } from '@/store/user';
import { authSelectors, userProfileSelectors } from '@/store/user/selectors';

import UserAvatar, { type UserAvatarProps } from './UserAvatar';

export interface UserInfoProps extends FlexboxProps {
  avatarProps?: Partial<UserAvatarProps>;
  onClick?: () => void;
}

const UserInfo = memo<UserInfoProps>(({ avatarProps, onClick, ...rest }) => {
  const theme = useTheme();
  const isSignedIn = useUserStore(authSelectors.isLogin);
  const [nickname, username, subscriptionPlan] = useUserStore((s) => [
    userProfileSelectors.nickName(s),
    userProfileSelectors.displayUserName(s),
    s.subscriptionPlan,
  ]);

  return (
    <Flexbox
      align={'center'}
      gap={12}
      horizontal
      justify={'space-between'}
      paddingBlock={12}
      paddingInline={12}
      {...rest}
    >
      <Flexbox align={'center'} gap={10} horizontal onClick={onClick}>
        <UserAvatar background={theme.colorFill} shape={'square'} size={36} {...avatarProps} />
        <Flexbox flex={1}>
          <Text style={{ lineHeight: 1.4 }} weight={'bold'}>
            {nickname}
          </Text>
          {username && (
            <Text fontSize={12} style={{ lineHeight: 1.4 }} type={'secondary'}>
              {username}
            </Text>
          )}
        </Flexbox>
      </Flexbox>
      {isSignedIn && <PlanTag type={subscriptionPlan} />}
    </Flexbox>
  );
});

export default UserInfo;
