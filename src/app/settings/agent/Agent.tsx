import isEqual from 'fast-deep-equal';
import { memo } from 'react';

import AgentSetting from '@/features/AgentSetting';
import { settingsSelectors, useGlobalStore } from '@/store/global';
import { useSwitchSideBarOnInit } from '@/store/global/hooks/useSwitchSettingsOnInit';
import { SettingsTabs } from '@/store/global/initialState';

const Agent = memo(() => {
  useSwitchSideBarOnInit(SettingsTabs.Agent);

  const config = useGlobalStore(settingsSelectors.defaultAgentConfig, isEqual);
  const meta = useGlobalStore(settingsSelectors.defaultAgentMeta, isEqual);
  const [updateAgent] = useGlobalStore((s) => [s.updateDefaultAgent]);

  return (
    <AgentSetting
      config={config}
      meta={meta}
      onConfigChange={(config) => {
        updateAgent({ config });
      }}
      onMetaChange={(meta) => {
        updateAgent({ meta });
      }}
    />
  );
});

export default Agent;
