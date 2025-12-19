'use client';

import { Avatar, Button, Skeleton } from '@lobehub/ui';
import { UserCircleIcon } from 'lucide-react';
import { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { useMarketAuth, useMarketUserProfile } from '@/layout/AuthProvider/MarketAuth';

const UserAvatar = memo(() => {
  const { t } = useTranslation('discover');
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
    const profileUserName = userProfile?.userName || userProfile?.namespace;
    if (profileUserName) {
      navigate(`/community/user/${profileUserName}`);
    }
  }, [navigate, userProfile?.userName]);

  if (isLoading) {
    return <Skeleton.Avatar active shape={'square'} size={28} style={{ borderRadius: 6 }} />;
  }

  if (!isAuthenticated) {
    return (
      <Button
        icon={UserCircleIcon}
        onClick={handleSignIn}
        style={{
          height: 30,
        }}
        type="text"
      >
        {t('user.login')}
      </Button>
    );
  }

  // Get avatar from user profile (fetched via SWR with caching)
  const avatarUrl = userProfile?.avatarUrl;

  return (
    <Avatar
      avatar={avatarUrl || userProfile?.userName}
      onClick={handleNavigateToProfile}
      shape={'square'}
      size={28}
    />
  );
});

export default UserAvatar;
