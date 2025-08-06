'use client';

import { Avatar, type AvatarProps } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { forwardRef, useMemo } from 'react';

import { BRANDING_NAME } from '@/const/branding';
import { DEFAULT_USER_AVATAR_URL } from '@/const/meta';
import { isDesktop } from '@/const/version';
import { useElectronStore } from '@/store/electron';
import { electronSyncSelectors } from '@/store/electron/selectors';
import { useUserStore } from '@/store/user';
import { authSelectors, userProfileSelectors } from '@/store/user/selectors';

const useStyles = createStyles(({ css, token }) => ({
  clickable: css`
    position: relative;
    transition: all 200ms ease-out 0s;

    &::before {
      content: '';

      position: absolute;
      transform: skewX(-45deg) translateX(-400%);

      overflow: hidden;

      box-sizing: border-box;
      width: 25%;
      height: 100%;

      background: rgba(255, 255, 255, 50%);

      transition: all 200ms ease-out 0s;
    }

    &:hover {
      box-shadow: 0 0 0 2px ${token.colorPrimary};

      &::before {
        transform: skewX(-45deg) translateX(400%);
      }
    }
  `,
}));

export interface UserAvatarProps extends AvatarProps {
  clickable?: boolean;
}

const UserAvatar = forwardRef<HTMLDivElement, UserAvatarProps>(
  ({ size = 40, background, clickable, className, style, ...rest }, ref) => {
    const { styles, cx } = useStyles();
    const [avatar, username] = useUserStore((s) => [
      userProfileSelectors.userAvatar(s),
      userProfileSelectors.username(s),
    ]);

    const isSignedIn = useUserStore(authSelectors.isLogin);
    const remoteServerUrl = useElectronStore(electronSyncSelectors.remoteServerUrl);

    // Process avatar URL for desktop environment
    const avatarUrl = useMemo(() => {
      if (!isSignedIn || !avatar) return DEFAULT_USER_AVATAR_URL;

      // If in desktop environment and avatar starts with /, prepend the remote server URL
      if (isDesktop && avatar.startsWith('/') && remoteServerUrl) {
        return remoteServerUrl + avatar;
      }

      return avatar;
    }, [isSignedIn, avatar, remoteServerUrl]);

    return (
      <Avatar
        alt={isSignedIn && !!username ? username : BRANDING_NAME}
        avatar={avatarUrl}
        background={isSignedIn && avatar ? background : 'transparent'}
        className={cx(clickable && styles.clickable, className)}
        ref={ref}
        size={size}
        style={{ flex: 'none', ...style }}
        unoptimized
        {...rest}
      />
    );
  },
);

UserAvatar.displayName = 'UserAvatar';

export default UserAvatar;
