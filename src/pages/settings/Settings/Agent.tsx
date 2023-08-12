import isEqual from 'fast-deep-equal';
import { memo } from 'react';
import { settingsSelectors, useSettings } from 'src/store/global';

import { AgentConfig, AgentMeta, AgentPlugin, AgentPrompt } from '@/features/AgentSetting';

const Agent = memo(() => {
  const config = useSettings(settingsSelectors.currentAgentConfig, isEqual);
  const meta = useSettings(settingsSelectors.currentAgentMeta, isEqual);
  const [setAgentConfig, setAgentMeta, toggleAgentPlugin] = useSettings((s) => [
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
