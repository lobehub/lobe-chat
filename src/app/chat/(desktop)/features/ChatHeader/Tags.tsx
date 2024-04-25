import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import ModelTag from '@/components/ModelTag';
import ModelSwitchPanel from '@/features/ModelSwitchPanel';
import { useAgentStore } from '@/store/agent';
import { agentSelectors } from '@/store/agent/selectors';
import { useGlobalStore } from '@/store/global';
import { modelProviderSelectors } from '@/store/global/selectors';

import PluginTag from '../../../features/PluginTag';

const TitleTags = memo(() => {
  const [model, plugins] = useAgentStore((s) => [
    agentSelectors.currentAgentModel(s),
    agentSelectors.currentAgentPlugins(s),
  ]);

  const showPlugin = useGlobalStore(modelProviderSelectors.isModelEnabledFunctionCall(model));

  return (
    <Flexbox gap={8} horizontal>
      <ModelSwitchPanel>
        <ModelTag model={model} />
      </ModelSwitchPanel>
      {showPlugin && plugins?.length > 0 && <PluginTag plugins={plugins} />}
    </Flexbox>
  );
});

export default TitleTags;
