import { memo } from 'react';

import ModelTag from '@/components/ModelTag';
import ModelSwitchPanel from '@/features/ModelSwitchPanel';
import { useGlobalStore } from '@/store/global';
import { modelProviderSelectors } from '@/store/global/selectors';
import { useSessionStore } from '@/store/session';
import { agentSelectors } from '@/store/session/selectors';

import PluginTag from '../../../features/PluginTag';

const TitleTags = memo(() => {
  const [model, plugins] = useSessionStore((s) => [
    agentSelectors.currentAgentModel(s),
    agentSelectors.currentAgentPlugins(s),
  ]);

  const showPlugin = useGlobalStore(modelProviderSelectors.modelEnabledFunctionCall(model));

  return (
    <>
      <ModelSwitchPanel>
        <ModelTag model={model} />
      </ModelSwitchPanel>
      {showPlugin && plugins?.length > 0 && <PluginTag plugins={plugins} />}
    </>
  );
});

export default TitleTags;
