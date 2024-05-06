'use client';

import { createStyles } from 'antd-style';
import { memo } from 'react';
import { Flexbox, FlexboxProps } from 'react-layout-kit';

import PlanTag from '@/features/User/PlanTag';
import { useUserStore } from '@/store/user';
import { userProfileSelectors } from '@/store/user/selectors';

import UserAvatar, { type UserAvatarProps } from './UserAvatar';

const useStyles = createStyles(({ css, token }) => ({
  nickname: css`
    font-size: 16px;
    font-weight: bold;
    line-height: 1;
  `,
  username: css`
    line-height: 1;
    color: ${token.colorTextDescription};
  `,
}));

export interface UserInfoProps extends FlexboxProps {
  avatarProps?: Partial<UserAvatarProps>;
}

const UserInfo = memo<UserInfoProps>(({ avatarProps, ...rest }) => {
  const { styles, theme } = useStyles();

  const [nickname, username] = useUserStore((s) => [
    userProfileSelectors.nickName(s),
    userProfileSelectors.username(s),
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
      <Flexbox align={'center'} gap={12} horizontal>
        <UserAvatar background={theme.colorFill} size={48} {...avatarProps} />
        <Flexbox flex={1} gap={6}>
          <div className={styles.nickname}>{nickname}</div>
          <div className={styles.username}>{username}</div>
        </Flexbox>
      </Flexbox>
      <PlanTag />
    </Flexbox>
  );
});

export default UserInfo;
