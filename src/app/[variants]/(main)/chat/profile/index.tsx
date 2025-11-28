'use client';

import { useTheme } from 'antd-style';
import isEqual from 'fast-deep-equal';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import Loading from '@/components/Loading/BrandTextLoading';
import { AgentSettingsProvider } from '@/features/AgentSetting/AgentSettingsProvider';
import { useAgentStore } from '@/store/agent';
import { agentSelectors } from '@/store/agent/selectors';
import { useSessionStore } from '@/store/session';
import { LobeSessionType } from '@/types/session';

import AgentSettings from './Settings/features/AgentSettings';
import SmartAgentActionButton from './Settings/features/SmartAgentActionButton';
import AgentConfigBar from './features/AgentConfigBar';
import AgentHeader from './features/AgentHeader';
import AutoSaveHint from './features/AutoSaveHint';
import EditorCanvas from './features/EditorCanvas';

const AgentProfile = memo(() => {
  const { t } = useTranslation('common');
  const theme = useTheme();
  const [showSettingsDrawer, setShowSettingsDrawer] = useState(false);
  const [agentId, isLoading, title, avatar, backgroundColor] = useAgentStore((s) => [
    s.activeAgentId,
    !s.isInboxAgentConfigInit,
    agentSelectors.currentAgentTitle(s),
    agentSelectors.currentAgentAvatar(s),
    agentSelectors.currentAgentBackgroundColor(s),
  ]);
  const config = useAgentStore(agentSelectors.currentAgentConfig, isEqual);

  // Create custom update functions that can target specific sessions
  const updateAgentConfig = async (config: any) => {
    // Find the agent session ID from the agent ID
    const sessions = useSessionStore.getState().sessions || [];
    const agentSession = sessions.find(
      (session) => session.type === LobeSessionType.Agent && session.config?.id === agentId,
    );

    if (agentSession) {
      // Use the internal agent store function with the specific session ID
      await useAgentStore.getState().internal_updateAgentConfig(agentSession.id, config);
    }
  };

  const updateAgentMeta = async (meta: any) => {
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
  };

  return (
    <AgentSettingsProvider
      config={config}
      id={agentId}
      loading={isLoading}
      meta={{
        avatar,
        backgroundColor,
        title: title || t('defaultSession'),
      }}
      onConfigChange={updateAgentConfig}
      onMetaChange={updateAgentMeta}
    >
      <Flexbox align="center" gap={12} horizontal justify={'flex-end'} padding={6}>
        <AutoSaveHint />
        <SmartAgentActionButton modal={false} />
      </Flexbox>
      <Flexbox
        height="100%"
        style={{
          background: theme.colorBgContainer,
          overflow: 'hidden',
        }}
      >
        {isLoading ? (
          <Flexbox align="center" height="100vh" justify="center">
            <Loading />
          </Flexbox>
        ) : (
          <>
            {/* Header: Avatar + Name + Description */}
            <AgentHeader />
            {/* Config Bar: Model Selector + Settings Button */}
            <AgentConfigBar onOpenSettings={() => setShowSettingsDrawer(true)} />
            {/* Main Content: Prompt Editor */}
            <EditorCanvas />
          </>
        )}
      </Flexbox>
      {/* Legacy AgentSettings Drawer (opened via Settings button) */}
      <AgentSettings
        agentId={agentId}
        onClose={() => setShowSettingsDrawer(false)}
        open={showSettingsDrawer}
      />
    </AgentSettingsProvider>
  );
});

export default AgentProfile;
