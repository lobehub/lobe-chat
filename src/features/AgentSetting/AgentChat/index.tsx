'use client';

import { Form, ItemGroup, SelectWithImg, SliderWithInput } from '@lobehub/ui';
import { Input, Switch } from 'antd';
import { useThemeMode } from 'antd-style';
import isEqual from 'fast-deep-equal';
import { LayoutList, MessagesSquare } from 'lucide-react';
import { memo, useLayoutEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { FORM_STYLE } from '@/const/layoutTokens';
import { imageUrl } from '@/const/url';

import { useStore } from '../store';
import { selectors } from '../store/selectors';

const AgentChat = memo(() => {
  const { t } = useTranslation('setting');
  const [form] = Form.useForm();
  const { isDarkMode } = useThemeMode();
  const [
    displayMode,
    enableAutoCreateTopic,
    enableHistoryCount,
    enableCompressThreshold,
    updateConfig,
  ] = useStore((s) => {
    const config = selectors.chatConfig(s);

    return [
      config.displayMode,
      config.enableAutoCreateTopic,
      config.enableHistoryCount,
      config.enableCompressThreshold,
      s.setChatConfig,
    ];
  });

  const config = useStore(selectors.chatConfig, isEqual);

  useLayoutEffect(() => {
    form.setFieldsValue(config);
  }, [config]);

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
            unoptimized={false}
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
    title: t('settingChat.title'),
  };

  return (
    <Form
      form={form}
      items={[chat]}
      itemsType={'group'}
      onValuesChange={updateConfig}
      variant={'pure'}
      {...FORM_STYLE}
    />
  );
});

export default AgentChat;
