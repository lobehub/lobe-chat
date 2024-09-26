import { ModelTag } from '@lobehub/icons';
import isEqual from 'fast-deep-equal';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import ModelSwitchPanel from '@/features/ModelSwitchPanel';
import { useModelName } from '@/hooks/useModelName';
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

  const modelName = useModelName(model);

  return (
    <Flexbox align={'center'} horizontal>
      <ModelSwitchPanel>
        <ModelTag model={modelName} />
      </ModelSwitchPanel>
      {showPlugin && plugins?.length > 0 && <PluginTag plugins={plugins} />}
      {hasKnowledge && <KnowledgeTag data={enabledKnowledge} />}
    </Flexbox>
  );
});

export default TitleTags;
