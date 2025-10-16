'use client';

import { Drawer } from '@lobehub/ui';
import isEqual from 'fast-deep-equal';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import HeaderContent from '@/app/[variants]/(main)/chat/settings/features/HeaderContent';
import BrandWatermark from '@/components/BrandWatermark';
import PanelTitle from '@/components/PanelTitle';
import { INBOX_SESSION_ID } from '@/const/session';
import { isDesktop } from '@/const/version';
import { AgentCategory, AgentSettings as Settings } from '@/features/AgentSetting';
import { AgentSettingsProvider } from '@/features/AgentSetting/AgentSettingsProvider';
import { TITLE_BAR_HEIGHT } from '@/features/ElectronTitlebar';
import Footer from '@/features/Setting/Footer';
import { useInitAgentConfig } from '@/hooks/useInitAgentConfig';
import { useAgentStore } from '@/store/agent';
import { agentSelectors } from '@/store/agent/slices/chat';
import { ChatSettingsTabs } from '@/store/global/initialState';
import { useSessionStore } from '@/store/session';
import { sessionMetaSelectors } from '@/store/session/selectors';
import { LobeSessionType } from '@/types/session';

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

  const [tab, setTab] = useState(isInbox ? ChatSettingsTabs.Prompt : ChatSettingsTabs.Meta);

  return (
    <AgentSettingsProvider
      config={config}
      id={id}
      loading={isLoading}
      meta={meta}
      onConfigChange={updateAgentConfig}
      onMetaChange={updateAgentMeta}
    >
      <Drawer
        containerMaxWidth={1280}
        height={isDesktop ? `calc(100vh - ${TITLE_BAR_HEIGHT}px)` : '100vh'}
        noHeader
        onClose={handleClose}
        open={isOpen}
        placement={'bottom'}
        sidebar={
          <Flexbox
            gap={20}
            style={{
              height: 'calc(100vh - 28px)',
            }}
          >
            <PanelTitle desc={t('header.sessionDesc')} title={t('header.session')} />
            <Flexbox flex={1} width={'100%'}>
              <AgentCategory setTab={setTab} tab={tab} />
            </Flexbox>
            <Flexbox align={'center'} gap={8} paddingInline={8} width={'100%'}>
              <HeaderContent modal />
            </Flexbox>
            <BrandWatermark paddingInline={12} />
          </Flexbox>
        }
        sidebarWidth={280}
        styles={{
          sidebarContent: {
            gap: 48,
            justifyContent: 'space-between',
            minHeight: isDesktop ? `calc(100% - ${TITLE_BAR_HEIGHT}px)` : '100%',
            paddingBlock: 24,
            paddingInline: 48,
          },
        }}
      >
        <Settings
          config={config}
          id={id}
          loading={isLoading}
          meta={meta}
          onConfigChange={updateAgentConfig}
          onMetaChange={updateAgentMeta}
          tab={tab}
        />
        <Footer />
      </Drawer>
    </AgentSettingsProvider>
  );
});

export default AgentSettings;
