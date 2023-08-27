import isEqual from 'fast-deep-equal';
import { memo } from 'react';

import AgentSetting from '@/features/AgentSetting';
import { settingsSelectors, useGlobalStore } from '@/store/global';

const Agent = memo(() => {
  const config = useGlobalStore(settingsSelectors.currentAgentConfig, isEqual);
  const meta = useGlobalStore(settingsSelectors.currentAgentMeta, isEqual);
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
