'use client';

import { Avatar } from '@lobehub/ui';
import { Button, Skeleton } from 'antd';
import { createStyles } from 'antd-style';
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

  const { isAuthenticated, isLoading, getCurrentUserInfo, signIn } = useMarketAuth();

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

  const handleNavigateToProfile = useCallback(() => {
    // Use userName from profile for the URL (not OIDC sub/id)
    const profileUserName = userProfile?.userName;
    if (profileUserName) {
      navigate(`/discover/user/${profileUserName}`);
    }
  }, [navigate, userProfile?.userName]);

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

  return (
    <Flexbox className={styles.avatar} onClick={handleNavigateToProfile}>
      <Avatar avatar={avatarUrl || undefined} size={32} />
    </Flexbox>
  );
});

export default UserAvatar;
