'use client';

import { Form, Icon, Text } from '@lobehub/ui';
import { Button, Spin } from 'antd';
import { createStyles } from 'antd-style';
import { PackageOpen } from 'lucide-react';
import { memo, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Center, Flexbox } from 'react-layout-kit';

import { useMarketAuth } from '@/layout/AuthProvider/MarketAuth';
import { useDiscoverStore } from '@/store/discover';
import { DiscoverAssistantItem } from '@/types/discover';

import AgentCard from './features/AgentCard';
import AgentDetailDrawer from './features/AgentDetailDrawer';

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

const MyAgentsPage = memo(() => {
  const { t } = useTranslation('setting');
  const { styles } = useStyles();
  const { isAuthenticated, signIn, getCurrentUserInfo } = useMarketAuth();
  const useAssistantList = useDiscoverStore((s) => s.useAssistantList);

  const [selectedAgent, setSelectedAgent] = useState<DiscoverAssistantItem | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Get current user's account ID
  const userInfo = getCurrentUserInfo();
  const ownerId = userInfo?.accountId?.toString();

  // Fetch user's published agents
  const { data, isLoading } = useAssistantList({
    ownerId,
    pageSize: 20,
    source: 'new',
  });

  const handleCardClick = useCallback((agent: DiscoverAssistantItem) => {
    setSelectedAgent(agent);
    setDrawerOpen(true);
  }, []);

  const handleCloseDrawer = useCallback(() => {
    setDrawerOpen(false);
    setSelectedAgent(null);
  }, []);

  const handleUnpublish = useCallback((identifier: string) => {
    // TODO: Implement unpublish functionality
    console.log('Unpublish agent:', identifier);
  }, []);

  const handleSignIn = useCallback(async () => {
    await signIn();
  }, [signIn]);

  // Sort agents by install count in descending order
  const sortedAgents = data?.items?.slice().sort((a, b) => {
    return (b.installCount || 0) - (a.installCount || 0);
  });

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
        <Flexbox className={styles.container} gap={16} padding={16}>
          <div className={styles.cardGrid}>
            {sortedAgents.map((agent) => (
              <AgentCard key={agent.identifier} onClick={() => handleCardClick(agent)} {...agent} />
            ))}
          </div>
        </Flexbox>
      </Form.Group>

      <AgentDetailDrawer
        agent={selectedAgent}
        onClose={handleCloseDrawer}
        onUnpublish={handleUnpublish}
        open={drawerOpen}
      />
    </>
  );
});

MyAgentsPage.displayName = 'MyAgentsPage';

export default MyAgentsPage;
