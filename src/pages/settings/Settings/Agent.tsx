import isEqual from 'fast-deep-equal';
import { memo } from 'react';

import { AgentConfig, AgentMeta, AgentPlugin, AgentPrompt } from '@/features/AgentSetting';
import { settingsSelectors, useGlobalStore } from '@/store/global';

const Agent = memo(() => {
  const config = useGlobalStore(settingsSelectors.currentAgentConfig, isEqual);
  const meta = useGlobalStore(settingsSelectors.currentAgentMeta, isEqual);
  const [setAgentConfig, setAgentMeta, toggleAgentPlugin] = useGlobalStore((s) => [
    s.setAgentConfig,
    s.setAgentMeta,
    s.toggleAgentPlugin,
  ]);
  return (
    <>
      <AgentPrompt config={config} updateConfig={setAgentConfig} />
      <AgentMeta config={config} meta={meta} updateMeta={setAgentMeta} />
      <AgentConfig config={config} updateConfig={setAgentConfig} />
      <AgentPlugin config={config} updateConfig={toggleAgentPlugin} />
    </>
  );
});

export default Agent;
