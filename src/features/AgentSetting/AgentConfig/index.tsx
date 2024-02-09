import { Form, ItemGroup, SelectWithImg, SliderWithInput } from '@lobehub/ui';
import { Form as AFrom, Input, Switch } from 'antd';
import { useThemeMode } from 'antd-style';
import { debounce } from 'lodash-es';
import { BrainCog, LayoutList, MessageSquare, MessagesSquare } from 'lucide-react';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { FORM_STYLE } from '@/const/layoutTokens';
import { imageUrl } from '@/const/url';

import { useStore } from '../store';
import ModelSelect from './ModelSelect';
import { useSyncConfig } from './useSyncConfig';

const AgentConfig = memo(() => {
  const { t } = useTranslation('setting');
  const [form] = AFrom.useForm();
  const { isDarkMode } = useThemeMode();

  const [
    displayMode,
    enableAutoCreateTopic,
    enableHistoryCount,
    enableMaxTokens,
    enableCompressThreshold,
    updateConfig,
  ] = useStore((s) => [
    s.config.displayMode,
    s.config.enableAutoCreateTopic,
    s.config.enableHistoryCount,
    s.config.enableCompressThreshold,
    s.config.enableMaxTokens,
    s.setAgentConfig,
  ]);

  useSyncConfig(form);

  const formItems = useMemo(() => {
    const chat: ItemGroup = {
      children: [
        {
          children: (
            <SelectWithImg
              height={86}
              onChange={(mode) => updateConfig({ displayMode: mode })}
              options={[
                {
                  icon: MessagesSquare,
                  img: imageUrl(`chatmode_chat_${isDarkMode ? 'dark' : 'light'}.webp`),
                  label: t('settingChat.chatStyleType.type.chat'),
                  value: 'chat',
                },
                {
                  icon: LayoutList,
                  img: imageUrl(`chatmode_docs_${isDarkMode ? 'dark' : 'light'}.webp`),
                  label: t('settingChat.chatStyleType.type.docs'),
                  value: 'docs',
                },
              ]}
              value={displayMode}
              width={144}
            />
          ),
          label: t('settingChat.chatStyleType.title'),
          minWidth: undefined,
        },
        {
          children: <Input.TextArea placeholder={t('settingChat.inputTemplate.placeholder')} />,
          desc: t('settingChat.inputTemplate.desc'),
          label: t('settingChat.inputTemplate.title'),
          name: 'inputTemplate',
        },
        {
          children: <Switch />,
          desc: t('settingChat.enableAutoCreateTopic.desc'),
          label: t('settingChat.enableAutoCreateTopic.title'),
          minWidth: undefined,
          name: 'enableAutoCreateTopic',
          valuePropName: 'checked',
        },
        {
          children: <SliderWithInput max={8} min={0} />,
          desc: t('settingChat.autoCreateTopicThreshold.desc'),
          divider: false,
          hidden: !enableAutoCreateTopic,
          label: t('settingChat.autoCreateTopicThreshold.title'),
          name: 'autoCreateTopicThreshold',
        },
        {
          children: <Switch />,
          label: t('settingChat.enableHistoryCount.title'),
          minWidth: undefined,
          name: 'enableHistoryCount',
          valuePropName: 'checked',
        },
        {
          children: <SliderWithInput max={32} min={1} />,
          desc: t('settingChat.historyCount.desc'),
          divider: false,
          hidden: !enableHistoryCount,
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
          divider: false,
          hidden: !enableCompressThreshold,
          label: t('settingChat.compressThreshold.title'),
          name: 'compressThreshold',
        },
      ],
      icon: MessageSquare,
      title: t('settingChat.title'),
    };

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
      icon: BrainCog,
      title: t('settingModel.title'),
    };
    return [chat, model];
  }, [
    displayMode,
    enableAutoCreateTopic,
    enableHistoryCount,
    enableMaxTokens,
    enableCompressThreshold,
  ]);

  return (
    <Form
      form={form}
      items={formItems}
      onValuesChange={debounce(updateConfig, 100)}
      {...FORM_STYLE}
    />
  );
});

export default AgentConfig;
