'use client';

import type { AgentItem } from '@lobechat/types';
import { Avatar, Text, Tooltip } from '@lobehub/ui';
import { Button, Popover } from 'antd';
import { createStyles } from 'antd-style';
import { MessageSquare } from 'lucide-react';
import { PropsWithChildren, memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { DEFAULT_AVATAR } from '@/const/meta';
import ModelSelect from '@/features/ModelSelect';
import { useAgentStore } from '@/store/agent';

const useStyles = createStyles(({ css, token }) => ({
  banner: css`
    position: relative;
    height: 60px;
    background: linear-gradient(135deg, ${token.colorPrimaryBg} 0%, ${token.colorPrimary} 100%);
    border-radius: ${token.borderRadiusLG}px ${token.borderRadiusLG}px 0 0;
  `,
  chatButton: css`
    width: 100%;
  `,
  container: css`
    overflow: hidden;
    width: 280px;
    border-radius: ${token.borderRadiusLG}px;
    background: ${token.colorBgElevated};
  `,
  description: css`
    overflow: hidden;

    max-height: 80px;

    font-size: 12px;
    line-height: 1.5;
    color: ${token.colorTextSecondary};
    text-overflow: ellipsis;
  `,
  header: css`
    position: relative;
    margin-block-start: -24px;
    padding-inline: 16px;
  `,
  modelLabel: css`
    font-size: 12px;
    color: ${token.colorTextTertiary};
  `,
  name: css`
    font-size: 16px;
    font-weight: 600;
    color: ${token.colorText};
  `,
  section: css`
    padding: 12px 16px;
  `,
  sectionTitle: css`
    margin-block-end: 8px;
    font-size: 11px;
    font-weight: 600;
    color: ${token.colorTextTertiary};
    text-transform: uppercase;
  `,
}));

interface AgentProfilePopupProps extends PropsWithChildren {
  agent: AgentItem;
  onChat: () => void;
}

const AgentProfilePopup = memo<AgentProfilePopupProps>(({ agent, onChat, children }) => {
  const { t } = useTranslation('chat');
  const { styles } = useStyles();
  const [open, setOpen] = useState(false);

  const updateAgentConfigById = useAgentStore((s) => s.updateAgentConfigById);

  const handleModelChange = async (props: { model: string; provider: string }) => {
    await updateAgentConfigById(agent.id, {
      model: props.model,
      provider: props.provider,
    });
  };

  const handleChat = () => {
    setOpen(false);
    onChat();
  };

  const content = (
    <Flexbox className={styles.container}>
      {/* Banner */}
      <div
        className={styles.banner}
        style={{
          background: agent.backgroundColor
            ? `linear-gradient(135deg, ${agent.backgroundColor}40 0%, ${agent.backgroundColor} 100%)`
            : undefined,
        }}
      />

      {/* Header with Avatar */}
      <Flexbox className={styles.header} gap={8}>
        <Avatar
          avatar={agent.avatar || DEFAULT_AVATAR}
          background={agent.backgroundColor ?? undefined}
          size={48}
          style={{
            border: '3px solid var(--lobe-colorBgElevated)',
            borderRadius: '50%',
          }}
        />
        <Flexbox gap={2}>
          <Text className={styles.name} ellipsis>
            {agent.title || t('defaultSession', { ns: 'common' })}
          </Text>
          {agent.description && (
            <Tooltip title={agent.description}>
              <Text className={styles.description} ellipsis={{ rows: 2 }}>
                {agent.description}
              </Text>
            </Tooltip>
          )}
        </Flexbox>
      </Flexbox>

      {/* Model Section */}
      <Flexbox className={styles.section} gap={4}>
        <div className={styles.sectionTitle}>{t('groupSidebar.agentProfile.model')}</div>
        <ModelSelect
          onChange={handleModelChange}
          size="small"
          value={{ model: agent.model || '', provider: agent.provider || '' }}
          variant="filled"
        />
      </Flexbox>

      {/* Actions */}
      <Flexbox className={styles.section} style={{ paddingBlockStart: 0 }}>
        <Button
          className={styles.chatButton}
          icon={<MessageSquare size={14} />}
          onClick={handleChat}
          type="primary"
        >
          {t('groupSidebar.agentProfile.chat')}
        </Button>
      </Flexbox>
    </Flexbox>
  );

  return (
    <Popover
      arrow={false}
      content={content}
      onOpenChange={setOpen}
      open={open}
      placement="right"
      styles={{
        body: {
          padding: 0,
        },
      }}
      trigger={['click']}
    >
      {children}
    </Popover>
  );
});

export default AgentProfilePopup;
