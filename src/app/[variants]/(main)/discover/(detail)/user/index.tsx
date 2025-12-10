'use client';

import { App } from 'antd';
import { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';
import { useLoaderData } from 'react-router-dom';

import type { SlugParams } from '@/app/[variants]/loaders/routeParams';
import { useMarketAuth, useMarketUserProfile } from '@/layout/AuthProvider/MarketAuth';
import { marketApiService } from '@/services/marketApi';
import { useDiscoverStore } from '@/store/discover';
import { DiscoverTab } from '@/types/discover';

import NotFound from '../components/NotFound';
import Breadcrumb from '../features/Breadcrumb';
import { AgentStatusAction } from './features/UserAgentCard';
import UserAgentList from './features/UserAgentList';
import UserHeader from './features/UserHeader';
import Loading from './loading';

interface UserDetailPageProps {
  mobile?: boolean;
}

const UserDetailPage = memo<UserDetailPageProps>(({ mobile }) => {
  const { slug } = useLoaderData() as SlugParams;
  const username = decodeURIComponent(slug);
  const { t } = useTranslation('setting');
  const { message } = App.useApp();

  const { getCurrentUserInfo, isAuthenticated, session, openProfileSetup } = useMarketAuth();

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

  const handleStatusChange = useCallback(
    async (identifier: string, action: AgentStatusAction) => {
      if (!session?.accessToken) {
        message.error(t('myAgents.errors.notAuthenticated'));
        return;
      }

      const messageKey = `agent-status-${action}`;
      const loadingText = t(`myAgents.actions.${action}Loading` as any);
      const successText = t(`myAgents.actions.${action}Success` as any);
      const errorText = t(`myAgents.actions.${action}Error` as any);

      try {
        message.loading({ content: loadingText, key: messageKey });
        marketApiService.setAccessToken(session.accessToken);

        switch (action) {
          case 'publish': {
            await marketApiService.publishAgent(identifier);
            break;
          }
          case 'unpublish': {
            await marketApiService.unpublishAgent(identifier);
            break;
          }
          case 'deprecate': {
            await marketApiService.deprecateAgent(identifier);
            break;
          }
        }

        message.success({ content: successText, key: messageKey });

        // Refresh the user profile
        mutate();
      } catch (error) {
        console.error(`[UserDetailPage] ${action} agent error:`, error);
        message.error({
          content: `${errorText}: ${error instanceof Error ? error.message : 'Unknown error'}`,
          key: messageKey,
        });
      }
    },
    [session?.accessToken, message, t, mutate],
  );

  if (isLoading) return <Loading />;
  if (!data || !data.user) return <NotFound />;

  const { user, agents } = data;

  // Calculate total installs
  const totalInstalls = agents.reduce((sum, agent) => sum + (agent.installCount || 0), 0);

  return (
    <>
      {!mobile && <Breadcrumb identifier={username} tab={DiscoverTab.User} />}
      <Flexbox gap={24}>
        <UserHeader
          agentCount={agents.length}
          isOwner={isOwner}
          mobile={mobile}
          onEditProfile={openProfileSetup}
          totalInstalls={totalInstalls}
          user={user}
        />
        <UserAgentList
          data={agents}
          isOwner={isOwner}
          onStatusChange={isOwner ? handleStatusChange : undefined}
        />
      </Flexbox>
    </>
  );
});

const DesktopUserDetailPage = memo(() => {
  return <UserDetailPage mobile={false} />;
});

const MobileUserDetailPage = memo(() => {
  return <UserDetailPage mobile={true} />;
});

export { DesktopUserDetailPage, MobileUserDetailPage };
