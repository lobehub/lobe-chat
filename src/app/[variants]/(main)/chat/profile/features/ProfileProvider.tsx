'use client';

import isEqual from 'fast-deep-equal';
import { PropsWithChildren, memo } from 'react';
import { useTranslation } from 'react-i18next';

import { AgentSettingsProvider } from '@/features/AgentSetting/AgentSettingsProvider';
import { useAgentStore } from '@/store/agent';
import { agentSelectors } from '@/store/agent/selectors';
import { useSessionStore } from '@/store/session';
import { LobeSessionType } from '@/types/session';

const ProfileProvider = memo<PropsWithChildren>(({ children }) => {
  const { t } = useTranslation('common');
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
      {children}
    </AgentSettingsProvider>
  );
});

export default ProfileProvider;
