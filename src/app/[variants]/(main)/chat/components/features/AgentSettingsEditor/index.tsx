'use client';

import { Drawer } from '@lobehub/ui';
import { useTheme } from 'antd-style';
import isEqual from 'fast-deep-equal';
import { memo, useState } from 'react';
import { Flexbox } from 'react-layout-kit';

import AgentSettings from '@/app/[variants]/(main)/chat/components/features/AgentSettings';
import SmartAgentActionButton from '@/app/[variants]/(main)/chat/settings/features/SmartAgentActionButton';
import Loading from '@/components/Loading/BrandTextLoading';
import { isDesktop } from '@/const/version';
import { AgentSettingsProvider } from '@/features/AgentSetting/AgentSettingsProvider';
import { TITLE_BAR_HEIGHT } from '@/features/ElectronTitlebar';
import { useInitAgentConfig } from '@/hooks/useInitAgentConfig';
import { useAgentStore } from '@/store/agent';
import { agentSelectors } from '@/store/agent/slices/chat';
import { useSessionStore } from '@/store/session';
import { sessionMetaSelectors } from '@/store/session/selectors';
import { LobeSessionType } from '@/types/session';

import AgentConfigBar from './AgentConfigBar';
import AgentHeader from './AgentHeader';
import AutoSaveHint from './AutoSaveHint';
import EditorCanvas from './EditorCanvas';

export interface AgentSettingsEditorProps {
  agentId?: string;
  onClose?: () => void;
  open?: boolean;
}

/**
 * AgentSettingsEditor - Clean editing interface for Agent configuration
 *
 * A document-centric, distraction-free interface that replaces the old tab-based UI.
 * Features:
 * - Top: Avatar, name, and description
 * - Middle: Model selector with Settings button
 * - Bottom: Rich text prompt editor with @ mention for tools
 *
 * The Settings button opens the legacy AgentSettings drawer for advanced configurations.
 */
const AgentSettingsEditor = memo<AgentSettingsEditorProps>(({ agentId, onClose, open }) => {
  const theme = useTheme();
  const [showSettingsDrawer, setShowSettingsDrawer] = useState(false);
  // Use provided agentId or fall back to current active session
  const activeId = useSessionStore((s) => s.activeId);
  const id = agentId || activeId;

  // Handle global store state or use props
  const [showAgentSetting] = useAgentStore((s) => [s.showAgentSetting]);

  // Determine visibility - use prop if provided, otherwise use global state
  const isOpen = open !== undefined ? open : showAgentSetting;

  // Handle close - use prop if provided, otherwise use global state setter
  const handleClose = onClose || (() => useAgentStore.setState({ showAgentSetting: false }));

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

  // Handle global store state
  const [globalUpdateAgentConfig] = useAgentStore((s) => [s.updateAgentConfig]);
  const [globalUpdateAgentMeta] = useSessionStore((s) => [s.updateSessionMeta]);

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

  return (
    <AgentSettingsProvider
      config={config}
      id={id}
      loading={isLoading}
      meta={meta}
      onConfigChange={updateAgentConfig}
      onMetaChange={updateAgentMeta}
    >
      {/* Main Drawer: Clean editing interface */}
      <Drawer
        extra={
          <Flexbox align="center" direction="horizontal" gap={12}>
            <AutoSaveHint />
            <SmartAgentActionButton modal={false} />
          </Flexbox>
        }
        height={isDesktop ? `calc(100vh - ${TITLE_BAR_HEIGHT}px)` : '100vh'}
        noHeader={true}
        onClose={handleClose}
        open={isOpen}
        placement="bottom"
        styles={{
          body: {
            padding: 0,
          },
        }}
        width="100%"
      >
        <Flexbox
          height="100%"
          style={{
            background: theme.colorBgContainer,
            overflow: 'hidden',
          }}
        >
          {(isLoading) ? (
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
      </Drawer>

      {/* Legacy AgentSettings Drawer (opened via Settings button) */}
      <AgentSettings
        agentId={agentId}
        onClose={() => setShowSettingsDrawer(false)}
        open={showSettingsDrawer}
      />
    </AgentSettingsProvider>
  );
});

export default AgentSettingsEditor;
