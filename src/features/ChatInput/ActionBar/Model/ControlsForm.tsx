import { Form } from '@lobehub/ui';
import type { FormItemProps } from '@lobehub/ui';
import { Switch } from 'antd';
import isEqual from 'fast-deep-equal';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { useAgentStore } from '@/store/agent';
import { agentSelectors } from '@/store/agent/slices/chat';
import { aiModelSelectors, useAiInfraStore } from '@/store/aiInfra';

import ReasoningTokenSlider from './ReasoningTokenSlider';

const ControlsForm = memo(() => {
  const { t } = useTranslation('chat');
  const [model, provider, updateAgentChatConfig] = useAgentStore((s) => [
    agentSelectors.currentAgentModel(s),
    agentSelectors.currentAgentModelProvider(s),
    s.updateAgentChatConfig,
  ]);
  const config = useAgentStore(agentSelectors.currentAgentChatConfig, isEqual);

  const modelExtendParams = useAiInfraStore(aiModelSelectors.modelExtendParams(model, provider));

  const items: FormItemProps[] = [
    {
      children: <Switch />,
      label: t('extendParams.enableReasoning.title'),
      minWidth: undefined,
      name: 'enableReasoning',
    },
    {
      children: <ReasoningTokenSlider />,
      label: t('extendParams.reasoningBudgetToken.title'),
      layout: 'vertical',
      minWidth: undefined,
      name: 'reasoningBudgetToken',
      style: {
        paddingBottom: 0,
      },
    },
  ];

  return (
    <Form
      initialValues={config}
      items={
        (modelExtendParams || [])
          .map((item: any) => items.find((i) => i.name === item))
          .filter(Boolean) as FormItemProps[]
      }
      itemsType={'flat'}
      onValuesChange={async (_, values) => {
        await updateAgentChatConfig(values);
      }}
      size={'small'}
      style={{ fontSize: 12 }}
      variant={'pure'}
    />
  );
});

export default ControlsForm;
