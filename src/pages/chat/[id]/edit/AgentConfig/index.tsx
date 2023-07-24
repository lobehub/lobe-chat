import { Form, ItemGroup } from '@lobehub/ui';
import { Input, Segmented, Select, Switch } from 'antd';
import isEqual from 'fast-deep-equal';
import { debounce } from 'lodash-es';
import { BrainCog, MessagesSquare } from 'lucide-react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { shallow } from 'zustand/shallow';

import { FORM_STYLE } from '@/const/layoutTokens';
import SliderWithInput from '@/features/SliderWithInput';
import { agentSelectors, useSessionStore } from '@/store/session';
import { LanguageModel } from '@/types/llm';
import type { LobeAgentConfig } from '@/types/session';

type SettingItemGroup = ItemGroup & {
  children: {
    name?: keyof LobeAgentConfig;
  }[];
};

const AgentConfig = () => {
  const { t } = useTranslation('setting');

  const config = useSessionStore(agentSelectors.currentAgentConfigSafe, isEqual);

  const [updateAgentConfig] = useSessionStore((s) => [s.updateAgentConfig], shallow);

  // TODO: setting 结构嵌套，现在是扁平的 params: { temperature: 0.6 }
  // @ts-ignore
  const chat: SettingItemGroup = useMemo(
    () => ({
      children: [
        {
          children: (
            <Segmented
              options={[
                { label: t('settingChat.chatStyleType.type.bubble'), value: 'chat' },
                { label: t('settingChat.chatStyleType.type.docs'), value: 'docs' },
              ]}
            />
          ),
          label: t('settingChat.chatStyleType.title'),
          minWidth: undefined,
          name: 'chatStyleType',
        },
        {
          children: <Input placeholder={t('settingChat.inputTemplate.placeholder')} />,
          desc: t('settingChat.inputTemplate.desc'),
          label: t('settingChat.inputTemplate.title'),
          name: 'enableHistoryCount',
        },
        {
          children: <Switch />,
          label: t('settingChat.enableHistoryCount.title'),
          minWidth: undefined,
          name: 'enableHistoryCount',
          valuePropName: 'checked',
        },
        {
          children: <SliderWithInput max={32} min={0} />,
          desc: t('settingChat.historyCount.desc'),
          // @ts-ignore
          hidden: !config.params.enableHistoryCount,
          label: t('settingChat.historyCount.title'),
          name: 'historyCount',
        },
        {
          children: <Switch />,
          label: t('settingChat.enableCompressThreshold.title'),
          minWidth: undefined,
          name: 'enableCompressThreshold',
          valuePropName: 'checked',
        },
        {
          children: <SliderWithInput max={32} min={0} />,
          desc: t('settingChat.compressThreshold.desc'),
          // @ts-ignore
          hidden: !config.params.enableCompressThreshold,
          label: t('settingChat.compressThreshold.title'),
          name: 'compressThreshold',
        },
      ],
      icon: MessagesSquare,
      title: t('settingChat.title'),
    }),
    [config],
  );

  // TODO: setting 结构嵌套，现在是扁平的 params: { temperature: 0.6 }
  // @ts-ignore
  const model: SettingItemGroup = useMemo(
    () => ({
      children: [
        {
          children: (
            <Select
              options={Object.values(LanguageModel).map((value) => ({
                label: value,
                value,
              }))}
            />
          ),
          desc: t('settingModel.model.desc'),
          label: t('settingModel.model.title'),
          name: 'model',
          tag: 'model',
        },
        {
          children: <SliderWithInput max={1} min={0} step={0.1} />,
          desc: t('settingModel.temperature.desc'),
          label: t('settingModel.temperature.title'),
          name: 'temperature',
          tag: 'temperature',
        },
        {
          children: <SliderWithInput max={1} min={0} step={0.1} />,
          desc: t('settingModel.topP.desc'),
          label: t('settingModel.topP.title'),
          name: 'topP',
          tag: 'top_p',
        },
        {
          children: <SliderWithInput max={2} min={-2} step={0.1} />,
          desc: t('settingModel.presencePenalty.desc'),
          label: t('settingModel.presencePenalty.title'),
          name: 'presencePenalty',
          tag: 'presence_penalty',
        },
        {
          children: <SliderWithInput max={2} min={-2} step={0.1} />,
          desc: t('settingModel.frequencyPenalty.desc'),
          label: t('settingModel.frequencyPenalty.title'),
          name: 'frequencyPenalty',
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
          // TODO
          // @ts-ignore
          hidden: !config?.params?.enableMaxTokens,
          label: t('settingModel.maxTokens.title'),
          name: 'params.maxTokens',
          tag: 'max_tokens',
        },
      ],
      icon: BrainCog,
      title: t('settingModel.title'),
    }),
    [config],
  );

  const items = useMemo(() => [chat, model], [config]);

  return (
    <Form
      initialValues={config}
      items={items}
      onValuesChange={debounce(updateAgentConfig, 100)}
      {...FORM_STYLE}
    />
  );
};

export default AgentConfig;
