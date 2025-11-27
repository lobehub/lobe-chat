'use client';

import { Modal } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import type { ItemType } from 'antd/es/menu/interface';
import isEqual from 'fast-deep-equal';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import Menu from '@/components/Menu';
import { INBOX_SESSION_ID } from '@/const/session';
import { AgentSettings as Settings } from '@/features/AgentSetting';
import { AgentSettingsProvider } from '@/features/AgentSetting/AgentSettingsProvider';
import { useAgentStore } from '@/store/agent';
import { agentSelectors } from '@/store/agent/selectors';
import { ChatSettingsTabs } from '@/store/global/initialState';
import { useSessionStore } from '@/store/session';

const useStyles = createStyles(({ css, token }) => ({
  content: css`
    overflow-y: auto;
    flex: 1;
    padding: ${token.paddingLG}px;
  `,
  modal: css`
    .ant-modal-content {
      padding: 0;
    }

    .ant-modal-header {
      margin-block-end: 0;
      padding: ${token.paddingLG}px;
      border-block-end: 1px solid ${token.colorBorderSecondary};
    }

    .ant-modal-body {
      overflow: hidden;
      height: 70vh;
      padding: 0;
    }
  `,
  sidebar: css`
    width: 200px;
    padding: ${token.paddingLG}px;
    border-inline-end: 1px solid ${token.colorBorderSecondary};
    background: ${token.colorFillQuaternary};
  `,
  sidebarTitle: css`
    margin-block-end: ${token.marginLG}px;
    padding-block: 0;
    padding-inline: ${token.paddingSM}px;

    font-size: ${token.fontSizeSM}px;
    font-weight: 600;
    color: ${token.colorTextSecondary};
  `,
}));

export interface AgentSettingsProps {
  agentId?: string;
  onClose?: () => void;
  open?: boolean;
}

/**
 * Support both agent ID and session ID
 * Consider choose agent id first, since
 * session ID will soon be deprecated
 */
const AgentSettings = memo<AgentSettingsProps>(({ agentId, onClose, open }) => {
  const { t } = useTranslation('setting');
  const { styles } = useStyles();

  // Use provided agentId or fall back to current active session
  const activeId = useSessionStore((s) => s.activeId);
  const id = agentId || activeId;

  // Get agent config based on the provided or active agent ID
  const config = useAgentStore((s) => {
    if (agentId) {
      // agentMap is now keyed by agentId, use getAgentConfigById directly
      return agentSelectors.getAgentConfigById(agentId)(s);
    }
    // Use current agent config
    return agentSelectors.currentAgentConfig(s);
  }, isEqual);
  const meta = useAgentStore((s) => {
    if (agentId) {
      // Use the selector that works with agent IDs
      return agentSelectors.getAgentMetaById(agentId)(s);
    } else {
      // Use current agent meta
      return agentSelectors.currentAgentMeta(s);
    }
  }, isEqual);

  const isLoading = false;

  // Handle global store state or use props
  const [showAgentSetting, globalUpdateAgentConfig, globalUpdateAgentMeta] = useAgentStore((s) => [
    s.showAgentSetting,
    s.updateAgentConfig,
    s.updateAgentMeta,
  ]);

  // Create custom update functions that can target specific sessions
  const updateAgentConfig = async (config: any) => {
    if (agentId) {
      // Use the optimistic update function with the specific agent ID
      await useAgentStore.getState().optimisticUpdateAgentConfig(agentId, config);
    } else {
      // Use the global update function for current session
      await globalUpdateAgentConfig(config);
    }
  };

  const updateAgentMeta = async (meta: any) => {
    if (agentId) {
      // Use the optimistic update function with the specific agent ID
      await useAgentStore.getState().optimisticUpdateAgentMeta(agentId, meta);
    } else {
      // Use the global update function for current session
      await globalUpdateAgentMeta(meta);
    }
  };

  // Determine visibility - use prop if provided, otherwise use global state
  const isOpen = open !== undefined ? open : showAgentSetting;

  // Handle close - use prop if provided, otherwise use global state setter
  const handleClose = onClose || (() => useAgentStore.setState({ showAgentSetting: false }));

  const isInbox = id === INBOX_SESSION_ID;

  const [tab, setTab] = useState(isInbox ? ChatSettingsTabs.Chat : ChatSettingsTabs.Opening);

  // Define available menu items (开场设置、聊天偏好、模型设置)
  const menuItems: ItemType[] = [
    !isInbox
      ? {
          key: ChatSettingsTabs.Opening,
          label: t('agentTab.opening'),
        }
      : null,
    {
      key: ChatSettingsTabs.Chat,
      label: t('agentTab.chat'),
    },
    {
      key: ChatSettingsTabs.Modal,
      label: t('agentTab.modal'),
    },
  ].filter(Boolean) as ItemType[];

  return (
    <AgentSettingsProvider
      config={config}
      id={id}
      loading={isLoading}
      meta={meta}
      onConfigChange={updateAgentConfig}
      onMetaChange={updateAgentMeta}
    >
      <Modal
        centered
        className={styles.modal}
        footer={null}
        onCancel={handleClose}
        open={isOpen}
        styles={{
          body: {
            padding: 0,
          },
        }}
        title={t('header.session')}
        width={800}
      >
        <Flexbox direction="horizontal" height="100%">
          {/* Left Sidebar */}
          <div className={styles.sidebar}>
            <div className={styles.sidebarTitle}>{t('header.session')}</div>
            <Menu
              compact
              items={menuItems}
              onClick={({ key }) => setTab(key as ChatSettingsTabs)}
              selectable
              selectedKeys={[tab]}
            />
          </div>

          {/* Right Content */}
          <div className={styles.content}>
            <Settings
              config={config}
              id={id}
              loading={isLoading}
              meta={meta}
              onConfigChange={updateAgentConfig}
              onMetaChange={updateAgentMeta}
              tab={tab}
            />
          </div>
        </Flexbox>
      </Modal>
    </AgentSettingsProvider>
  );
});

export default AgentSettings;
