import { Form } from '@lobehub/ui';
import type { FormItemProps } from '@lobehub/ui';
import { Form as AntdForm, Switch } from 'antd';
import isEqual from 'fast-deep-equal';
import Link from 'next/link';
import { memo } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { useAgentStore } from '@/store/agent';
import { agentChatConfigSelectors, agentSelectors } from '@/store/agent/selectors';
import { aiModelSelectors, useAiInfraStore } from '@/store/aiInfra';

import ContextCachingSwitch from './ContextCachingSwitch';
import ReasoningEffortSlider from './ReasoningEffortSlider';
import ReasoningTokenSlider from './ReasoningTokenSlider';
import ThinkingBudgetSlider from './ThinkingBudgetSlider';
import ThinkingSlider from './ThinkingSlider';

const ControlsForm = memo(() => {
  const { t } = useTranslation('chat');
  const [model, provider, updateAgentChatConfig] = useAgentStore((s) => [
    agentSelectors.currentAgentModel(s),
    agentSelectors.currentAgentModelProvider(s),
    s.updateAgentChatConfig,
  ]);
  const [form] = Form.useForm();
  const enableReasoning = AntdForm.useWatch(['enableReasoning'], form);

  const config = useAgentStore(agentChatConfigSelectors.currentChatConfig, isEqual);

  const modelExtendParams = useAiInfraStore(aiModelSelectors.modelExtendParams(model, provider));

  const items = [
    {
      children: <ContextCachingSwitch />,
      desc: (
        <span style={{ display: 'inline-block', width: 300 }}>
          <Trans i18nKey={'extendParams.disableContextCaching.desc'} ns={'chat'}>
            单条对话生成成本最高可降低 90%，响应速度提升 4 倍（
            <Link
              href={'https://www.anthropic.com/news/prompt-caching?utm_source=lobechat'}
              rel={'nofollow'}
            >
              了解更多
            </Link>
            ）。开启后将自动禁用历史记录限制
          </Trans>
        </span>
      ),
      label: t('extendParams.disableContextCaching.title'),
      minWidth: undefined,
      name: 'disableContextCaching',
    },
    {
      children: <Switch />,
      desc: (
        <span style={{ display: 'inline-block', width: 300 }}>
          <Trans i18nKey={'extendParams.enableReasoning.desc'} ns={'chat'}>
            基于 Claude Thinking 机制限制（
            <Link
              href={
                'https://docs.anthropic.com/en/docs/build-with-claude/extended-thinking?utm_source=lobechat#why-thinking-blocks-must-be-preserved'
              }
              rel={'nofollow'}
            >
              了解更多
            </Link>
            ），开启后将自动禁用历史消息数限制
          </Trans>
        </span>
      ),
      label: t('extendParams.enableReasoning.title'),
      layout: 'horizontal',
      minWidth: undefined,
      name: 'enableReasoning',
    },
    enableReasoning && {
      children: <ReasoningTokenSlider />,
      label: t('extendParams.reasoningBudgetToken.title'),
      layout: 'vertical',
      minWidth: undefined,
      name: 'reasoningBudgetToken',
      style: {
        paddingBottom: 0,
      },
    },
    {
      children: <ReasoningEffortSlider />,
      desc: 'reasoning_effort',
      label: t('extendParams.reasoningEffort.title'),
      layout: 'horizontal',
      minWidth: undefined,
      name: 'reasoningEffort',
      style: {
        paddingBottom: 0,
      },
    },
    {
      children: <ThinkingBudgetSlider />,
      label: t('extendParams.reasoningBudgetToken.title'),
      layout: 'vertical',
      minWidth: 500,
      name: 'thinkingBudget',
      style: {
        paddingBottom: 0,
      },
      tag: 'thinkingBudget',
    },
    {
      children: <ThinkingSlider />,
      label: t('extendParams.thinking.title'),
      layout: 'horizontal',
      minWidth: undefined,
      name: 'thinking',
      style: {
        paddingBottom: 0,
      },
    },
  ].filter(Boolean) as FormItemProps[];

  return (
    <Form
      form={form}
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
      variant={'borderless'}
    />
  );
});

export default ControlsForm;
