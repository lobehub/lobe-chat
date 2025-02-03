'use client';

import { Form, ItemGroup, SliderWithInput } from '@lobehub/ui';
import { Select, Switch } from 'antd';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { FORM_STYLE } from '@/const/layoutTokens';
import { useProviderName } from '@/hooks/useProviderName';

import { useStore } from '../store';
import { selectors } from '../store/selectors';
import { useAgentSyncSettings } from '../useSyncAgemtSettings';
import ModelSelect from './ModelSelect';

const AgentModal = memo(() => {
  const { t } = useTranslation('setting');
  const [form] = Form.useForm();

  const [enableMaxTokens, enableReasoningEffort, updateConfig] = useStore((s) => {
    const config = selectors.chatConfig(s);
    return [config.enableMaxTokens, config.enableReasoningEffort, s.setAgentConfig];
  });

  const providerName = useProviderName(useStore((s) => s.config.provider) as string);

  useAgentSyncSettings(form);

  const model: ItemGroup = {
    children: [
      {
        children: <ModelSelect />,
        desc: t('settingModel.model.desc', { provider: providerName }),
        label: t('settingModel.model.title'),
        name: 'model',
        tag: 'model',
      },
      {
        children: <SliderWithInput max={2} min={0} step={0.1} />,
        desc: t('settingModel.temperature.desc'),
        label: t('settingModel.temperature.title'),
        name: ['params', 'temperature'],
        tag: 'temperature',
      },
      {
        children: <SliderWithInput max={1} min={0} step={0.1} />,
        desc: t('settingModel.topP.desc'),
        label: t('settingModel.topP.title'),
        name: ['params', 'top_p'],
        tag: 'top_p',
      },
      {
        children: <SliderWithInput max={2} min={-2} step={0.1} />,
        desc: t('settingModel.presencePenalty.desc'),
        label: t('settingModel.presencePenalty.title'),
        name: ['params', 'presence_penalty'],
        tag: 'presence_penalty',
      },
      {
        children: <SliderWithInput max={2} min={-2} step={0.1} />,
        desc: t('settingModel.frequencyPenalty.desc'),
        label: t('settingModel.frequencyPenalty.title'),
        name: ['params', 'frequency_penalty'],
        tag: 'frequency_penalty',
      },
      {
        children: <Switch />,
        label: t('settingModel.enableMaxTokens.title'),
        minWidth: undefined,
        name: ['chatConfig', 'enableMaxTokens'],
        valuePropName: 'checked',
      },
      {
        children: <SliderWithInput max={32_000} min={0} step={100} />,
        desc: t('settingModel.maxTokens.desc'),
        divider: false,
        hidden: !enableMaxTokens,
        label: t('settingModel.maxTokens.title'),
        name: ['params', 'max_tokens'],
        tag: 'max_tokens',
      },
      {
        children: <Switch />,
        label: t('settingModel.enableReasoningEffort.title'),
        minWidth: undefined,
        name: ['chatConfig', 'enableReasoningEffort'],
        valuePropName: 'checked',
      },
      {
        children: (
          <Select
            defaultValue='medium'
            options={[
              { label: t('settingModel.reasoningEffort.options.low'), value: 'low' },
              { label: t('settingModel.reasoningEffort.options.medium'), value: 'medium' },
              { label: t('settingModel.reasoningEffort.options.high'), value: 'high' },
            ]}
          />
        ),
        desc: t('settingModel.reasoningEffort.desc'),
        hidden: !enableReasoningEffort,
        label: t('settingModel.reasoningEffort.title'),
        name: ['params', 'reasoning_effort'],
        tag: 'reasoning_effort',
      },
    ],
    title: t('settingModel.title'),
  };

  return (
    <Form
      form={form}
      items={[model]}
      itemsType={'group'}
      onValuesChange={updateConfig}
      variant={'pure'}
      {...FORM_STYLE}
    />
  );
});

export default AgentModal;
