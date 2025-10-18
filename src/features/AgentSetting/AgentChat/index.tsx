'use client';

import { Form, type FormGroupItemType, ImageSelect, SliderWithInput, TextArea } from '@lobehub/ui';
import { Form as AForm, Radio, Switch } from 'antd';
import { useThemeMode } from 'antd-style';
import isEqual from 'fast-deep-equal';
import { LayoutList, MessagesSquare } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { FORM_STYLE } from '@/const/layoutTokens';
import { imageUrl } from '@/const/url';

import { selectors, useStore } from '../store';

const AUTO_SUGGESTION_SETTING_KEY = 'autoSuggestion';

const AgentChat = memo(() => {
  const { t } = useTranslation('setting');
  const [form] = Form.useForm();
  const { isDarkMode } = useThemeMode();
  const updateConfig = useStore((s) => s.setChatConfig);
  const config = useStore(selectors.currentChatConfig, isEqual);
  const enableAutoSuggestion = AForm.useWatch([AUTO_SUGGESTION_SETTING_KEY, 'enabled'], form);
  const chat: FormGroupItemType = {
    children: [
      {
        children: (
          <ImageSelect
            height={86}
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
            style={{
              marginRight: 2,
            }}
            unoptimized={false}
            width={144}
          />
        ),
        label: t('settingChat.chatStyleType.title'),
        minWidth: undefined,
        name: 'displayMode',
      },
      {
        children: <TextArea placeholder={t('settingChat.inputTemplate.placeholder')} />,
        desc: t('settingChat.inputTemplate.desc'),
        label: t('settingChat.inputTemplate.title'),
        name: 'inputTemplate',
      },
      {
        children: <Switch />,
        desc: t('settingChat.enableAutoCreateTopic.desc'),
        label: t('settingChat.enableAutoCreateTopic.title'),
        layout: 'horizontal',
        minWidth: undefined,
        name: 'enableAutoCreateTopic',
        valuePropName: 'checked',
      },
      {
        children: <SliderWithInput max={8} min={0} unlimitedInput={true} />,
        desc: t('settingChat.autoCreateTopicThreshold.desc'),
        divider: false,
        hidden: !config.enableAutoCreateTopic,
        label: t('settingChat.autoCreateTopicThreshold.title'),
        name: 'autoCreateTopicThreshold',
      },
      {
        children: <Switch />,
        label: t('settingChat.enableHistoryCount.title'),
        layout: 'horizontal',
        minWidth: undefined,
        name: 'enableHistoryCount',
        valuePropName: 'checked',
      },
      {
        children: <SliderWithInput max={20} min={0} unlimitedInput={true} />,
        desc: t('settingChat.historyCount.desc'),
        divider: false,
        hidden: !config.enableHistoryCount,
        label: t('settingChat.historyCount.title'),
        name: 'historyCount',
      },
      {
        children: <Switch />,
        hidden: !config.enableHistoryCount,
        label: t('settingChat.enableCompressHistory.title'),
        layout: 'horizontal',
        minWidth: undefined,
        name: 'enableCompressHistory',
        valuePropName: 'checked',
      },
      // 基础设置
      {
        children: <Switch />,
        desc: t('agent.autoSuggestion.enabled.desc'),
        label: t('agent.autoSuggestion.enabled.title'),
        layout: 'horizontal',
        minWidth: undefined,
        name: [AUTO_SUGGESTION_SETTING_KEY, 'enabled'],
        valuePropName: 'checked',
      },
      {
        children: (
          <Radio.Group
            optionType="button"
            options={[
              { label: '1', value: 1 },
              { label: '2', value: 2 },
              { label: '3', value: 3 },
            ]}
          />
        ),
        desc: t('agent.autoSuggestion.maxSuggestions.desc'),
        hidden: !enableAutoSuggestion,
        label: t('agent.autoSuggestion.maxSuggestions.title'),
        name: [AUTO_SUGGESTION_SETTING_KEY, 'maxSuggestions'],
      },
    ],
    title: t('settingChat.title'),
  };

  return (
    <Form
      footer={
        <Form.SubmitFooter
          texts={{
            reset: t('submitFooter.reset'),
            submit: t('settingChat.submit'),
            unSaved: t('submitFooter.unSaved'),
            unSavedWarning: t('submitFooter.unSavedWarning'),
          }}
        />
      }
      form={form}
      initialValues={config}
      items={[chat]}
      itemsType={'group'}
      onFinish={updateConfig}
      variant={'borderless'}
      {...FORM_STYLE}
    />
  );
});

export default AgentChat;
