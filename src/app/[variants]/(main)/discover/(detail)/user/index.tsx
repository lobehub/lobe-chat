'use client';

import { memo, useMemo } from 'react';
import { useParams } from 'react-router-dom';

import { useMarketAuth, useMarketUserProfile } from '@/layout/AuthProvider/MarketAuth';
import { useDiscoverStore } from '@/store/discover';

import NotFound from '../components/NotFound';
import { UserDetailProvider } from './features/DetailProvider';
import UserHeader from './features/Header';
import UserAgentList from './features/UserAgentList';
import { useUserDetail } from './features/useUserDetail';
import Loading from './loading';

interface UserDetailPageProps {
  mobile?: boolean;
}

const UserDetailPage = memo<UserDetailPageProps>(({ mobile }) => {
  const params = useParams<{ slug: string }>();
  const username = decodeURIComponent(params.slug ?? '');

  const { getCurrentUserInfo, isAuthenticated, openProfileSetup } = useMarketAuth();

  const useUserProfile = useDiscoverStore((s) => s.useUserProfile);
  const { data, isLoading, mutate } = useUserProfile({ username });

  // Get current user's profile to check ownership by userName
  const currentUser = getCurrentUserInfo();
  const { data: currentUserProfile } = useMarketUserProfile(currentUser?.sub);

  // Check if the current user is viewing their own profile
  const isOwner =
    isAuthenticated &&
    !!currentUser &&
    !!data?.user?.userName &&
    !!currentUserProfile?.userName &&
    data.user.userName === currentUserProfile.userName;

  const { handleStatusChange } = useUserDetail({ onMutate: mutate });

  const contextConfig = useMemo(() => {
    if (!data || !data.user) return null;
    const { user, agents } = data;
    const totalInstalls = agents.reduce((sum, agent) => sum + (agent.installCount || 0), 0);
    return {
      agentCount: agents.length,
      agents,
      isOwner,
      mobile,
      onEditProfile: openProfileSetup,
      onStatusChange: isOwner ? handleStatusChange : undefined,
      totalInstalls,
      user,
    };
  }, [data, isOwner, mobile, openProfileSetup, handleStatusChange]);

  if (isLoading) return <Loading />;
  if (!contextConfig) return <NotFound />;

  return (
    <UserDetailProvider config={contextConfig}>
      <UserHeader />
      <UserAgentList />
    </UserDetailProvider>
  );
});

export const MobileUserDetailPage = memo(() => {
  return <UserDetailPage mobile={true} />;
});

export default UserDetailPage;
