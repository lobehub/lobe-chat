'use client';

import isEqual from 'fast-deep-equal';
import { memo } from 'react';

import { INBOX_SESSION_ID } from '@/const/session';
import AgentChat from '@/features/AgentSetting/AgentChat';
import AgentMeta from '@/features/AgentSetting/AgentMeta';
import AgentModal from '@/features/AgentSetting/AgentModal';
import AgentPlugin from '@/features/AgentSetting/AgentPlugin';
import AgentPrompt from '@/features/AgentSetting/AgentPrompt';
import AgentTTS from '@/features/AgentSetting/AgentTTS';
import StoreUpdater from '@/features/AgentSetting/StoreUpdater';
import { Provider, createStore } from '@/features/AgentSetting/store';
import { useUserStore } from '@/store/user';
import { settingsSelectors } from '@/store/user/selectors';

const Page = memo(() => {
  const config = useUserStore(settingsSelectors.defaultAgentConfig, isEqual);
  const meta = useUserStore(settingsSelectors.defaultAgentMeta, isEqual);
  const [updateAgent] = useUserStore((s) => [s.updateDefaultAgent]);

  return (
    <Provider createStore={createStore}>
      <StoreUpdater
        config={config}
        id={INBOX_SESSION_ID}
        meta={meta}
        onConfigChange={(config) => {
          updateAgent({ config });
        }}
        onMetaChange={(meta) => {
          updateAgent({ meta });
        }}
      />
      <AgentPrompt />
      <AgentMeta />
      <AgentChat />
      <AgentModal />
      <AgentTTS />
      <AgentPlugin />
    </Provider>
  );
});

Page.displayName = 'AgentSetting';

export default Page;
