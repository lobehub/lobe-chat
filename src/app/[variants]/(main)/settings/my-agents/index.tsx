'use client';

import { AgentListResponse } from '@lobehub/market-sdk';
import { Form, Icon, Text } from '@lobehub/ui';
import { App, Button, Pagination, Spin } from 'antd';
import { createStyles } from 'antd-style';
import { PackageOpen } from 'lucide-react';
import { memo, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Center, Flexbox } from 'react-layout-kit';
import useSWR from 'swr';

import { useMarketAuth } from '@/layout/AuthProvider/MarketAuth';
import { marketApiService } from '@/services/marketApi';
import { AgentStatus, DiscoverAssistantItem } from '@/types/discover';

import AgentCard from './features/AgentCard';
import AgentDetailDrawer, { AgentStatusAction } from './features/AgentDetailDrawer';

const PAGE_SIZE = 20;

const useStyles = createStyles(({ css, token }) => ({
  cardGrid: css`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 16px;
    width: 100%;
  `,
  container: css`
    width: 100%;
  `,
  emptyDescription: css`
    color: ${token.colorTextSecondary};
  `,
  emptyIcon: css`
    display: flex;
    align-items: center;
    justify-content: center;

    width: 64px;
    height: 64px;
    margin-block-end: ${token.marginMD}px;
    border-radius: 50%;

    background-color: ${token.colorFillTertiary};
  `,
  emptyTitle: css`
    margin-block-end: ${token.marginSM}px;
    font-size: ${token.fontSizeLG}px;
    font-weight: 500;
  `,
}));

// AgentItem type from AgentListResponse (not exported from SDK)
type AgentItem = AgentListResponse['items'][number];

// Transform AgentItem from SDK to DiscoverAssistantItem
const transformAgentToDiscoverItem = (agent: AgentItem): DiscoverAssistantItem => ({
  author: (agent as any).owner?.name || '',
  avatar: (agent as any).avatar || '',
  category: (agent as any).category as any,
  config: (agent as any).config || {},
  createdAt: (agent as any).createdAt,
  description: (agent as any).description || '',
  homepage: (agent as any).homepage || '',
  identifier: (agent as any).identifier,
  installCount: (agent as any).installCount || 0,
  knowledgeCount: (agent as any).knowledgeCount || 0,
  pluginCount: (agent as any).pluginCount || 0,
  status: (agent as any).status as AgentStatus | undefined,
  tags: (agent as any).tags || [],
  title: (agent as any).name,
  tokenUsage: (agent as any).tokenUsage || 0,
});

const MyAgentsPage = memo(() => {
  const { t } = useTranslation('setting');
  const { styles } = useStyles();
  const { isAuthenticated, signIn, session } = useMarketAuth();
  const { message } = App.useApp();

  const [selectedAgent, setSelectedAgent] = useState<DiscoverAssistantItem | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch user's own agents using getOwnAgents API with pagination
  const { data, isLoading, mutate } = useSWR(
    isAuthenticated && session?.accessToken
      ? ['getOwnAgents', session.accessToken, currentPage]
      : null,
    async ([, accessToken, page]) => {
      marketApiService.setAccessToken(accessToken);
      return marketApiService.getOwnAgents({ page, pageSize: PAGE_SIZE });
    },
  );

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handleCardClick = useCallback((agent: DiscoverAssistantItem) => {
    setSelectedAgent(agent);
    setDrawerOpen(true);
  }, []);

  const handleCloseDrawer = useCallback(() => {
    setDrawerOpen(false);
    setSelectedAgent(null);
  }, []);

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

        // Refresh the agent list
        mutate();

        // Close drawer after successful action
        setDrawerOpen(false);
        setSelectedAgent(null);
      } catch (error) {
        console.error(`[MyAgentsPage] ${action} agent error:`, error);
        message.error({
          content: `${errorText}: ${error instanceof Error ? error.message : 'Unknown error'}`,
          key: messageKey,
        });
      }
    },
    [session?.accessToken, message, t, mutate],
  );

  const handleSignIn = useCallback(async () => {
    await signIn();
  }, [signIn]);

  // Transform and sort agents by install count in descending order
  const sortedAgents = data?.items
    ?.map(transformAgentToDiscoverItem)
    .sort((a, b) => (b.installCount || 0) - (a.installCount || 0));

  // Show login prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <Form.Group
        style={{ maxWidth: '1024px', width: '100%' }}
        title={t('myAgents.title')}
        variant={'borderless'}
      >
        <Center className={styles.container} gap={16} padding={40}>
          <Flexbox align="center">
            <div className={styles.emptyIcon}>
              <Icon icon={PackageOpen} size={32} />
            </div>
            <Text className={styles.emptyTitle}>{t('myAgents.loginRequired.title')}</Text>
            <Text className={styles.emptyDescription}>
              {t('myAgents.loginRequired.description')}
            </Text>
          </Flexbox>
          <Button onClick={handleSignIn} type="primary">
            {t('myAgents.loginRequired.button')}
          </Button>
        </Center>
      </Form.Group>
    );
  }

  // Show loading state
  if (isLoading) {
    return (
      <Form.Group
        style={{ maxWidth: '1024px', width: '100%' }}
        title={t('myAgents.title')}
        variant={'borderless'}
      >
        <Center className={styles.container} padding={40}>
          <Spin />
        </Center>
      </Form.Group>
    );
  }

  // Show empty state
  if (!sortedAgents || sortedAgents.length === 0) {
    return (
      <Form.Group
        style={{ maxWidth: '1024px', width: '100%' }}
        title={t('myAgents.title')}
        variant={'borderless'}
      >
        <Center className={styles.container} padding={40}>
          <Flexbox align="center">
            <div className={styles.emptyIcon}>
              <Icon icon={PackageOpen} size={32} />
            </div>
            <Text className={styles.emptyTitle}>{t('myAgents.empty.title')}</Text>
            <Text className={styles.emptyDescription}>{t('myAgents.empty.description')}</Text>
          </Flexbox>
        </Center>
      </Form.Group>
    );
  }

  return (
    <>
      <Form.Group
        style={{ maxWidth: '1024px', width: '100%' }}
        title={t('myAgents.title')}
        variant={'borderless'}
      >
        <Flexbox className={styles.container} gap={16}>
          <div className={styles.cardGrid}>
            {sortedAgents.map((agent) => (
              <AgentCard key={agent.identifier} onClick={() => handleCardClick(agent)} {...agent} />
            ))}
          </div>
          {data && data.totalPages > 1 && (
            <Flexbox align="center" justify="center" style={{ marginTop: 16 }}>
              <Pagination
                current={currentPage}
                onChange={handlePageChange}
                pageSize={PAGE_SIZE}
                showSizeChanger={false}
                total={data.totalCount}
              />
            </Flexbox>
          )}
        </Flexbox>
      </Form.Group>

      <AgentDetailDrawer
        agent={selectedAgent}
        onClose={handleCloseDrawer}
        onStatusChange={handleStatusChange}
        open={drawerOpen}
      />
    </>
  );
});

MyAgentsPage.displayName = 'MyAgentsPage';

export default MyAgentsPage;
