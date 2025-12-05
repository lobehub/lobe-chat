'use client';

import { IEditor } from '@lobehub/editor';
import { useEditor } from '@lobehub/editor/react';
import isEqual from 'fast-deep-equal';
import { PropsWithChildren, createContext, memo, useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { AgentSettingsProvider } from '@/features/AgentSetting/AgentSettingsProvider';
import { useAgentStore } from '@/store/agent';
import { agentSelectors, builtinAgentSelectors } from '@/store/agent/selectors';

interface ProfileContextValue {
  chatPanelExpanded: boolean;
  editor: IEditor;
  setChatPanelExpanded: (expanded: boolean | ((prev: boolean) => boolean)) => void;
}

const ProfileContext = createContext<ProfileContextValue | null>(null);

export const useProfileContext = () => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfileContext must be used within ProfileProvider');
  }
  return context;
};

const ProfileProvider = memo<PropsWithChildren>(({ children }) => {
  const { t } = useTranslation('common');
  const [chatPanelExpanded, setChatPanelExpanded] = useState(true);
  const editor = useEditor();
  const [agentId, isLoading, title, avatar, backgroundColor, updateAgentConfig, updateAgentMeta] =
    useAgentStore((s) => [
      s.activeAgentId,
      !builtinAgentSelectors.isInboxAgentConfigInit(s),
      agentSelectors.currentAgentTitle(s),
      agentSelectors.currentAgentAvatar(s),
      agentSelectors.currentAgentBackgroundColor(s),
      s.updateAgentConfig,
      s.updateAgentMeta,
    ]);
  const config = useAgentStore(agentSelectors.currentAgentConfig, isEqual);

  return (
    <ProfileContext.Provider value={{ chatPanelExpanded, editor, setChatPanelExpanded }}>
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
    </ProfileContext.Provider>
  );
});

export default ProfileProvider;
