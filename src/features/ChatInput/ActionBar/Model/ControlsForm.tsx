import { Form } from '@lobehub/ui';
import { Switch } from 'antd';
import { memo } from 'react';

import { useAgentStore } from '@/store/agent';
import { agentSelectors } from '@/store/agent/slices/chat';
import { aiModelSelectors, useAiInfraStore } from '@/store/aiInfra';

const ControlsForm = memo(() => {
  const [model, provider] = useAgentStore((s) => [
    agentSelectors.currentAgentModel(s),
    agentSelectors.currentAgentModelProvider(s),
  ]);
  const modelExtendControls = useAiInfraStore(
    aiModelSelectors.modelExtendControls(model, provider),
  );

  return (
    <Form
      itemMinWidth={200}
      items={modelExtendControls!.map((item) => ({
        children: <Switch />,
        label: item.requestParams,
        minWidth: undefined,
        name: item.key,
      }))}
      itemsType={'flat'}
      size={'small'}
      style={{ fontSize: 12 }}
      variant={'pure'}
    />
  );
});

export default ControlsForm;
