'use client';

import { Avatar, Icon, Tag, Tooltip } from '@lobehub/ui';
import { App, Button, Drawer, Typography } from 'antd';
import { createStyles } from 'antd-style';
import { CoinsIcon, DownloadIcon, ExternalLink, Pencil, Trash2 } from 'lucide-react';
import { memo, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';
import { useNavigate } from 'react-router-dom';
import urlJoin from 'url-join';

import { agentService } from '@/services/agent';
import { discoverService } from '@/services/discover';
import { useAgentStore } from '@/store/agent';
import { useHomeStore } from '@/store/home';
import { DiscoverAssistantItem } from '@/types/discover';
import { formatIntergerNumber } from '@/utils/format';

const { Title, Paragraph } = Typography;

const useStyles = createStyles(({ css, token }) => ({
  actions: css`
    border-block-start: 1px solid ${token.colorBorder};
  `,
  content: css`
    overflow-y: auto;
    flex: 1;
  `,
  description: css`
    margin: 0 !important;
    color: ${token.colorTextSecondary};
  `,
  header: css`
    border-block-end: 1px solid ${token.colorBorder};
  `,
  statTag: css`
    border-radius: 4px;

    font-family: ${token.fontFamilyCode};
    font-size: 12px;
    color: ${token.colorTextSecondary};

    background: ${token.colorFillTertiary};
  `,
  title: css`
    margin: 0 !important;
    font-size: 18px !important;
  `,
}));

interface AgentDetailDrawerProps {
  agent: DiscoverAssistantItem | null;
  onClose: () => void;
  onUnpublish?: (identifier: string) => void;
  open: boolean;
}

const AgentDetailDrawer = memo<AgentDetailDrawerProps>(({ open, onClose, agent, onUnpublish }) => {
  const { styles, theme } = useStyles();
  const { t } = useTranslation('setting');
  const { t: tDiscover } = useTranslation('discover');
  const navigate = useNavigate();
  const { message } = App.useApp();

  const [isEditLoading, setIsEditLoading] = useState(false);
  const createAgent = useAgentStore((s) => s.createAgent);
  const refreshAgentList = useHomeStore((s) => s.refreshAgentList);

  const handleViewDetail = useCallback(() => {
    if (agent?.identifier) {
      window.open(urlJoin('/discover/assistant', agent.identifier), '_blank');
    }
  }, [agent?.identifier]);

  const handleEdit = useCallback(async () => {
    if (!agent?.identifier) return;

    setIsEditLoading(true);
    try {
      // First, try to find the local agent by market identifier
      const localAgentId = await agentService.getAgentByMarketIdentifier(agent.identifier);

      if (localAgentId) {
        // Agent exists locally, navigate to edit
        navigate(urlJoin('/agent', localAgentId, 'profile'));
        onClose();
      } else {
        // Agent doesn't exist locally, fetch from market and create
        const marketAgent = await discoverService.getAssistantDetail({
          identifier: agent.identifier,
          source: 'new',
        });

        if (!marketAgent) {
          message.error(t('myAgents.errors.fetchFailed'));
          return;
        }

        // Create local agent with market data
        // Note: agentService.createAgent automatically normalizes market config (handles model as object)
        const result = await createAgent({
          config: {
            ...marketAgent.config,
            avatar: marketAgent.avatar,
            backgroundColor: marketAgent.backgroundColor,
            description: marketAgent.description,
            editorData: marketAgent.editorData,
            marketIdentifier: agent.identifier,
            tags: marketAgent.tags,
            title: marketAgent.title,
          },
        });

        await refreshAgentList();

        if (result.agentId) {
          navigate(urlJoin('/agent', result.agentId, 'profile'));
          onClose();
        }
      }
    } catch (error) {
      console.error('[AgentDetailDrawer] handleEdit error:', error);
      message.error(t('myAgents.errors.editFailed'));
    } finally {
      setIsEditLoading(false);
    }
  }, [agent, navigate, onClose, createAgent, refreshAgentList, message, t]);

  const handleUnpublish = useCallback(() => {
    if (agent?.identifier && onUnpublish) {
      onUnpublish(agent.identifier);
    }
  }, [agent?.identifier, onUnpublish]);

  if (!agent) return null;

  return (
    <Drawer
      onClose={onClose}
      open={open}
      placement="right"
      styles={{
        body: { display: 'flex', flexDirection: 'column', padding: 0 },
      }}
      title={t('myAgents.detail.title')}
      width={400}
    >
      <Flexbox className={styles.content} gap={16} padding={16}>
        {/* Header with Avatar and Title */}
        <Flexbox align="center" gap={12} horizontal>
          <Avatar
            avatar={agent.avatar}
            background={agent.backgroundColor || 'transparent'}
            size={56}
            style={{ flex: 'none' }}
          />
          <Flexbox flex={1} gap={4}>
            <Title className={styles.title} level={4}>
              {agent.title}
            </Title>
            {agent.author && <Typography.Text type="secondary">{agent.author}</Typography.Text>}
          </Flexbox>
        </Flexbox>

        {/* Stats */}
        <Flexbox gap={8} horizontal wrap="wrap">
          <Tooltip title={tDiscover('assistants.tokenUsage')}>
            <Tag className={styles.statTag} icon={<Icon icon={CoinsIcon} />}>
              {formatIntergerNumber(agent.tokenUsage)}
            </Tag>
          </Tooltip>
          {agent.installCount !== undefined && (
            <Tooltip title={tDiscover('assistants.downloads')}>
              <Tag className={styles.statTag} icon={<Icon icon={DownloadIcon} />}>
                {formatIntergerNumber(agent.installCount)}
              </Tag>
            </Tooltip>
          )}
        </Flexbox>

        {/* Description */}
        <Flexbox gap={8}>
          <Typography.Text strong>{t('myAgents.detail.description')}</Typography.Text>
          <Paragraph className={styles.description}>{agent.description}</Paragraph>
        </Flexbox>

        {/* Category */}
        {agent.category && (
          <Flexbox gap={8}>
            <Typography.Text strong>{t('myAgents.detail.category')}</Typography.Text>
            <Tag color={theme.colorPrimary}>
              {tDiscover(`category.assistant.${agent.category}` as any)}
            </Tag>
          </Flexbox>
        )}

        {/* Identifier */}
        <Flexbox gap={8}>
          <Typography.Text strong>{t('myAgents.detail.identifier')}</Typography.Text>
          <Typography.Text code copyable>
            {agent.identifier}
          </Typography.Text>
        </Flexbox>
      </Flexbox>

      {/* Actions */}
      <Flexbox className={styles.actions} gap={12} padding={16}>
        <Button block icon={<Icon icon={ExternalLink} />} onClick={handleViewDetail}>
          {t('myAgents.actions.viewDetail')}
        </Button>
        <Button
          block
          icon={<Icon icon={Pencil} />}
          loading={isEditLoading}
          onClick={handleEdit}
          type="primary"
        >
          {t('myAgents.actions.edit')}
        </Button>
        <Button block danger icon={<Icon icon={Trash2} />} onClick={handleUnpublish}>
          {t('myAgents.actions.unpublish')}
        </Button>
      </Flexbox>
    </Drawer>
  );
});

export default AgentDetailDrawer;
