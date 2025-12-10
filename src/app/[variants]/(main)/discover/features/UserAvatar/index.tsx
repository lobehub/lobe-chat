'use client';

import { Avatar, Dropdown } from '@lobehub/ui';
import { Button, Skeleton } from 'antd';
import { createStyles } from 'antd-style';
import { LogOut, User } from 'lucide-react';
import { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';
import { useNavigate } from 'react-router-dom';

import { useMarketAuth, useMarketUserProfile } from '@/layout/AuthProvider/MarketAuth';

const useStyles = createStyles(({ css, token }) => ({
  avatar: css`
    cursor: pointer;
    border: 2px solid ${token.colorBorder};
    border-radius: 50%;

    &:hover {
      border-color: ${token.colorPrimary};
    }
  `,
  loginButton: css`
    font-size: 13px;
  `,
}));

const UserAvatar = memo(() => {
  const { t } = useTranslation('discover');
  const { styles } = useStyles();
  const navigate = useNavigate();

  const { isAuthenticated, isLoading, getCurrentUserInfo, signIn, signOut } = useMarketAuth();

  const userInfo = getCurrentUserInfo();
  const username = userInfo?.sub;

  // Use SWR to fetch user profile with caching
  const { data: userProfile } = useMarketUserProfile(username);

  const handleSignIn = useCallback(async () => {
    try {
      await signIn();
    } catch {
      // User cancelled or error occurred
    }
  }, [signIn]);

  const handleSignOut = useCallback(async () => {
    await signOut();
  }, [signOut]);

  const handleNavigateToProfile = useCallback(() => {
    if (username) {
      navigate(`/discover/user/${username}`);
    }
  }, [navigate, username]);

  if (isLoading) {
    return <Skeleton.Avatar active size={32} />;
  }

  if (!isAuthenticated) {
    return (
      <Button className={styles.loginButton} onClick={handleSignIn} size="small" type="primary">
        {t('user.login')}
      </Button>
    );
  }

  // Get avatar from user profile (fetched via SWR with caching)
  const avatarUrl = userProfile?.avatarUrl;

  const menuItems = [
    {
      icon: <User size={16} />,
      key: 'profile',
      label: t('user.myProfile'),
      onClick: handleNavigateToProfile,
    },
    {
      type: 'divider' as const,
    },
    {
      danger: true,
      icon: <LogOut size={16} />,
      key: 'logout',
      label: t('user.logout'),
      onClick: handleSignOut,
    },
  ];

  return (
    <Dropdown menu={{ items: menuItems }} placement="bottomRight" trigger={['click']}>
      <Flexbox className={styles.avatar}>
        <Avatar avatar={avatarUrl || undefined} size={32} />
      </Flexbox>
    </Dropdown>
  );
});

export default UserAvatar;
