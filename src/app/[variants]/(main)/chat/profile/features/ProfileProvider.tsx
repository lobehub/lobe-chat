'use client';

import { useEditor } from '@lobehub/editor/react';
import isEqual from 'fast-deep-equal';
import { PropsWithChildren, memo } from 'react';
import { useTranslation } from 'react-i18next';

import { AgentSettingsProvider } from '@/features/AgentSetting/AgentSettingsProvider';
import { useAgentStore } from '@/store/agent';
import { agentSelectors, builtinAgentSelectors } from '@/store/agent/selectors';

import StoreUpdater from './StoreUpdater';
import { Provider, createStore } from './store';

const ProfileProvider = memo<PropsWithChildren>(({ children }) => {
  const { t } = useTranslation('common');
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
    <Provider createStore={() => createStore({ editor })}>
      <StoreUpdater />
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
    </Provider>
  );
});

export default ProfileProvider;
