import isEqual from 'fast-deep-equal';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import ModelTag from '@/components/ModelTag';
import ModelSwitchPanel from '@/features/ModelSwitchPanel';
import { useAgentStore } from '@/store/agent';
import { agentSelectors } from '@/store/agent/selectors';
import { useUserStore } from '@/store/user';
import { modelProviderSelectors } from '@/store/user/selectors';

import PluginTag from '../../../features/PluginTag';
import KnowledgeTag from './KnowledgeTag';

const TitleTags = memo(() => {
  const [model, hasKnowledge] = useAgentStore((s) => [
    agentSelectors.currentAgentModel(s),
    agentSelectors.hasKnowledge(s),
  ]);
  const plugins = useAgentStore(agentSelectors.currentAgentPlugins, isEqual);
  const enabledKnowledge = useAgentStore(agentSelectors.currentEnabledKnowledge, isEqual);

  const showPlugin = useUserStore(modelProviderSelectors.isModelEnabledFunctionCall(model));

  return (
    <Flexbox align={'center'} horizontal>
      <ModelSwitchPanel>
        <ModelTag model={model} />
      </ModelSwitchPanel>
      {showPlugin && plugins?.length > 0 && <PluginTag plugins={plugins} />}
      {hasKnowledge && <KnowledgeTag data={enabledKnowledge} />}
    </Flexbox>
  );
});

export default TitleTags;
