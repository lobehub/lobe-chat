'use client';

import type { ItemType } from 'antd/es/menu/interface';
import { Modal } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import isEqual from 'fast-deep-equal';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import Menu from '@/components/Menu';
import { INBOX_SESSION_ID } from '@/const/session';
import { AgentSettings as Settings } from '@/features/AgentSetting';
import { AgentSettingsProvider } from '@/features/AgentSetting/AgentSettingsProvider';
import { useInitAgentConfig } from '@/hooks/useInitAgentConfig';
import { useAgentStore } from '@/store/agent';
import { agentSelectors } from '@/store/agent/slices/chat';
import { ChatSettingsTabs } from '@/store/global/initialState';
import { useSessionStore } from '@/store/session';
import { sessionMetaSelectors } from '@/store/session/selectors';
import { LobeSessionType } from '@/types/session';

const useStyles = createStyles(({ css, token }) => ({
  content: css`
    flex: 1;
    padding: ${token.paddingLG}px;
    overflow-y: auto;
  `,
  modal: css`
    .ant-modal-content {
      padding: 0;
    }

    .ant-modal-header {
      padding: ${token.paddingLG}px;
      margin-bottom: 0;
      border-bottom: 1px solid ${token.colorBorderSecondary};
    }

    .ant-modal-body {
      padding: 0;
      height: 70vh;
      overflow: hidden;
    }
  `,
  sidebar: css`
    width: 200px;
    padding: ${token.paddingLG}px;
    border-right: 1px solid ${token.colorBorderSecondary};
    background: ${token.colorFillQuaternary};
  `,
  sidebarTitle: css`
    margin-bottom: ${token.marginLG}px;
    padding: 0 ${token.paddingSM}px;
    color: ${token.colorTextSecondary};
    font-size: ${token.fontSizeSM}px;
    font-weight: 600;
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

  // Get agent config and meta based on the provided or active agent ID
  const config = useAgentStore((s) => {
    if (agentId) {
      // Use the new selector that works with agent IDs
      return agentSelectors.getAgentConfigByAgentId(agentId)(s);
    } else if (id) {
      // Use the existing selector for session IDs
      return agentSelectors.getAgentConfigById(id)(s);
    } else {
      // Use current agent config
      return agentSelectors.currentAgentConfig(s);
    }
  }, isEqual);
  const meta = useSessionStore((s) => {
    if (agentId) {
      // Use the selector that works with agent IDs
      return sessionMetaSelectors.getAgentMetaByAgentId(agentId)(s);
    } else {
      // Use current agent meta for session-based access
      return sessionMetaSelectors.currentAgentMeta(s);
    }
  }, isEqual);

  const { isLoading } = useInitAgentConfig(agentId);

  // Handle global store state or use props
  const [showAgentSetting, globalUpdateAgentConfig] = useAgentStore((s) => [
    s.showAgentSetting,
    s.updateAgentConfig,
  ]);
  const [globalUpdateAgentMeta] = useSessionStore((s) => [
    s.updateSessionMeta,
    sessionMetaSelectors.currentAgentTitle(s),
  ]);

  // Create custom update functions that can target specific sessions
  const updateAgentConfig = async (config: any) => {
    if (agentId) {
      // Find the agent session ID from the agent ID
      const sessions = useSessionStore.getState().sessions || [];
      const agentSession = sessions.find(
        (session) => session.type === LobeSessionType.Agent && session.config?.id === agentId,
      );

      if (agentSession) {
        // Use the internal agent store function with the specific session ID
        await useAgentStore.getState().internal_updateAgentConfig(agentSession.id, config);
      }
    } else {
      // Use the global update function for current session
      await globalUpdateAgentConfig(config);
    }
  };

  const updateAgentMeta = async (meta: any) => {
    if (agentId) {
      // Find the agent session ID from the agent ID
      const sessions = useSessionStore.getState().sessions || [];
      const agentSession = sessions.find(
        (session) => session.type === LobeSessionType.Agent && session.config?.id === agentId,
      );

      if (agentSession) {
        // Use the session service directly with the specific session ID
        const { sessionService } = await import('@/services/session');
        await sessionService.updateSessionMeta(agentSession.id, meta);
        // Refresh sessions to update the UI
        await useSessionStore.getState().refreshSessions();
      }
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
    !isInbox && {
      key: ChatSettingsTabs.Opening,
      label: t('agentTab.opening'),
    },
    {
      key: ChatSettingsTabs.Chat,
      label: t('agentTab.chat'),
    },
    {
      key: ChatSettingsTabs.Modal,
      label: t('agentTab.modal'),
    },
  ].filter(Boolean);

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
          body:{
            padding:0,
          }
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
