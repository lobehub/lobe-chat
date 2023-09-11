import { Form, ItemGroup, SelectWithImg, SliderWithInput } from '@lobehub/ui';
import { ConfigProvider, Input, Select, Switch } from 'antd';
import { useTheme, useThemeMode } from 'antd-style';
import isEqual from 'fast-deep-equal';
import { debounce } from 'lodash-es';
import { BrainCog, LayoutList, MessageSquare, MessagesSquare } from 'lucide-react';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { FORM_STYLE } from '@/const/layoutTokens';
import { LanguageModel } from '@/types/llm';
import { LobeAgentConfigKeys } from '@/types/session';

import { useStore } from '../store';

type SettingItemGroup = ItemGroup & {
  children: {
    name?: LobeAgentConfigKeys | string | string[];
  }[];
};

const AgentConfig = memo(() => {
  const { t } = useTranslation('setting');
  const updateConfig = useStore((s) => s.setAgentConfig);
  const config = useStore((s) => s.config, isEqual);
  const theme = useTheme();
  const { isDarkMode } = useThemeMode();

  const chat: SettingItemGroup = useMemo(
    () => ({
      children: [
        {
          children: (
            <SelectWithImg
              height={86}
              options={[
                {
                  icon: MessagesSquare,
                  img: `/images/chatmode_chat_${isDarkMode ? 'dark' : 'light'}.webp`,
                  label: t('settingChat.chatStyleType.type.chat'),
                  value: 'chat',
                },
                {
                  icon: LayoutList,
                  img: `/images/chatmode_docs_${isDarkMode ? 'dark' : 'light'}.webp`,
                  label: t('settingChat.chatStyleType.type.docs'),
                  value: 'docs',
                },
              ]}
              styles={{
                img: {
                  background: `linear-gradient(
                  to bottom,
                ${isDarkMode ? theme.colorBgElevated : theme.colorBgLayout},
                ${theme.colorBgContainer}
                )`,
                },
              }}
              width={144}
            />
          ),
          label: t('settingChat.chatStyleType.title'),
          minWidth: undefined,
          name: 'displayMode',
        },
        {
          children: <Input placeholder={t('settingChat.inputTemplate.placeholder')} />,
          desc: t('settingChat.inputTemplate.desc'),
          label: t('settingChat.inputTemplate.title'),
          name: 'inputTemplate',
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
          divider: false,
          hidden: !config.enableHistoryCount,
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
          hidden: !config.enableCompressThreshold,
          label: t('settingChat.compressThreshold.title'),
          name: 'compressThreshold',
        },
      ],
      icon: MessageSquare,
      title: t('settingChat.title'),
    }),
    [config],
  );

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
          hidden: !config?.enableMaxTokens,
          label: t('settingModel.maxTokens.title'),
          name: ['params', 'max_tokens'],
          tag: 'max_tokens',
        },
      ],
      icon: BrainCog,
      title: t('settingModel.title'),
    }),
    [config],
  );

  return (
    <ConfigProvider
      theme={{
        components: {
          Segmented: {
            colorBgLayout: theme.isDarkMode ? '#111' : '#f1f1f1',
          },
        },
      }}
    >
      <Form
        initialValues={config}
        items={[chat, model]}
        onValuesChange={debounce(updateConfig, 100)}
        {...FORM_STYLE}
      />
    </ConfigProvider>
  );
});

export default AgentConfig;
