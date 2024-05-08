'use client';

import { Form, ItemGroup, SliderWithInput } from '@lobehub/ui';
import { Switch } from 'antd';
import { debounce } from 'lodash-es';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { FORM_STYLE } from '@/const/layoutTokens';

import { useStore } from '../store';
import { useAgentSyncSettings } from '../useSyncAgemtSettings';
import ModelSelect from './ModelSelect';

const AgentModal = memo(() => {
  const { t } = useTranslation('setting');
  const [form] = Form.useForm();

  const [enableMaxTokens, updateConfig] = useStore((s) => [
    s.config.enableMaxTokens,
    s.setAgentConfig,
  ]);

  useAgentSyncSettings(form);

  const model: ItemGroup = {
    children: [
      {
        children: <ModelSelect />,
        desc: t('settingModel.model.desc'),
        label: t('settingModel.model.title'),
        name: 'model',
        tag: 'model',
      },
      {
        children: <SliderWithInput max={1} min={0} step={0.1} />,
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
        name: 'enableMaxTokens',
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
    ],
    title: t('settingModel.title'),
  };

  return (
    <Form
      form={form}
      items={[model]}
      itemsType={'group'}
      onValuesChange={debounce(updateConfig, 100)}
      variant={'pure'}
      {...FORM_STYLE}
    />
  );
});

export default AgentModal;
