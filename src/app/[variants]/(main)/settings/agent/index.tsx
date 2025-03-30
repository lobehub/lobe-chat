'use client';

import isEqual from 'fast-deep-equal';
import { useQueryState } from 'nuqs';
import { memo } from 'react';

import { INBOX_SESSION_ID } from '@/const/session';
import { AgentSettings } from '@/features/AgentSetting';
import { ChatSettingsTabs } from '@/store/global/initialState';
import { useUserStore } from '@/store/user';
import { settingsSelectors } from '@/store/user/selectors';

const Page = memo(() => {
  const [tab] = useQueryState('tab', {
    defaultValue: ChatSettingsTabs.Prompt,
  });
  const config = useUserStore(settingsSelectors.defaultAgentConfig, isEqual);
  const meta = useUserStore(settingsSelectors.defaultAgentMeta, isEqual);
  const [updateAgent] = useUserStore((s) => [s.updateDefaultAgent]);
  const isUserStateInit = useUserStore((s) => s.isUserStateInit);

  return (
    <AgentSettings
      config={config}
      id={INBOX_SESSION_ID}
      loading={!isUserStateInit}
      meta={meta}
      onConfigChange={(config) => {
        updateAgent({ config });
      }}
      onMetaChange={(meta) => {
        updateAgent({ meta });
      }}
      tab={tab as ChatSettingsTabs}
    />
  );
});

Page.displayName = 'AgentSetting';

export default Page;
