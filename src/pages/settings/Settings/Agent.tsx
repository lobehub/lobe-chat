import isEqual from 'fast-deep-equal';
import { memo } from 'react';

import AgentSetting from '@/features/AgentSetting';
import { globalSelectors, useGlobalStore } from '@/store/global';

const Agent = memo(() => {
  const config = useGlobalStore(globalSelectors.defaultAgentConfig, isEqual);
  const meta = useGlobalStore(globalSelectors.defaultAgentMeta, isEqual);
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
