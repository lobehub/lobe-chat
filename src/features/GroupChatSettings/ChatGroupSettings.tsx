'use client';

import { Form, type FormGroupItemType, Select, SliderWithInput } from '@lobehub/ui';
import { Input, Switch } from 'antd';
import { isEqual } from 'lodash';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { FORM_STYLE } from '@/const/layoutTokens';

import ModelSelect from '../ModelSelect';
import { selectors, useStore } from './store';

const { TextArea } = Input;

/**
 * Chat Settings for Group Chat
 */
const ChatGroupSettings = memo(() => {
  const { t } = useTranslation(['setting', 'common']);
  const [form] = Form.useForm();
  const updateConfig = useStore((s) => s.updateGroupConfig);
  const config = useStore(selectors.currentChatConfig, isEqual);

  const responseSpeedOptions = [
    { label: t('settingGroupChat.responseSpeed.options.slow'), value: 'slow' },
    { label: t('settingGroupChat.responseSpeed.options.medium'), value: 'medium' },
    { label: t('settingGroupChat.responseSpeed.options.fast'), value: 'fast' },
  ];

  const orchestratorSettings: FormGroupItemType = {
    children: [
      {
        children: <ModelSelect />,
        desc: t('settingGroupChat.model.desc'),
        label: t('settingGroupChat.model.title'),
        name: '_modelConfig',
      },
      {
        children: (
          <TextArea
            autoSize={{ maxRows: 8, minRows: 3 }}
            placeholder={t('settingGroupChat.systemPrompt.placeholder')}
            rows={4}
          />
        ),
        desc: t('settingGroupChat.systemPrompt.desc'),
        label: t('settingGroupChat.systemPrompt.title'),
        name: 'systemPrompt',
      },
    ],
    title: t('settingGroupChat.orchestratorTitle'),
  };

  const chatSettings: FormGroupItemType = {
    children: [
      {
        children: (
          <Select
            options={responseSpeedOptions}
            placeholder={t('settingGroupChat.responseSpeed.placeholder')}
          />
        ),
        desc: t('settingGroupChat.responseSpeed.desc'),
        label: t('settingGroupChat.responseSpeed.title'),
        name: 'responseSpeed',
      },
      {
        children: (
          <Select
            options={[
              {
                label: t('settingGroupChat.responseOrder.options.sequential'),
                value: 'sequential',
              },
              { label: t('settingGroupChat.responseOrder.options.natural'), value: 'natural' },
            ]}
            placeholder={t('settingGroupChat.responseOrder.placeholder')}
          />
        ),
        desc: t('settingGroupChat.responseOrder.desc'),
        label: t('settingGroupChat.responseOrder.title'),
        name: 'responseOrder',
      },
      {
        children: <SliderWithInput max={32} min={0} step={1} unlimitedInput={true} />,
        desc: t('settingGroupChat.maxResponseInRow.desc'),
        divider: false,
        label: t('settingGroupChat.maxResponseInRow.title'),
        name: 'maxResponseInRow',
      },
      {
        children: <Switch />,
        desc: t('settingGroupChat.revealDM.desc'),
        divider: false,
        label: t('settingGroupChat.revealDM.title'),
        name: 'revealDM',
      },
      {
        children: <Switch />,
        desc: t('settingGroupChat.allowDM.desc'),
        divider: false,
        label: t('settingGroupChat.allowDM.title'),
        name: 'allowDM',
      },
    ],
    title: t('settingGroupChat.title'),
  };

  return (
    <Form
      footer={
        <Form.SubmitFooter
          texts={{
            reset: t('submitFooter.reset'),
            submit: t('submitFooter.submit'),
            unSaved: t('submitFooter.unSaved'),
            unSavedWarning: t('submitFooter.unSavedWarning'),
          }}
        />
      }
      form={form}
      initialValues={{
        ...config,
        _modelConfig: {
          model: config?.orchestratorModel,
          provider: config?.orchestratorProvider,
        },
      }}
      items={[orchestratorSettings, chatSettings]}
      itemsType={'group'}
      onFinish={({ _modelConfig, ...rest }) => {
        updateConfig({
          orchestratorModel: _modelConfig?.model,
          orchestratorProvider: _modelConfig?.provider,
          ...rest,
        });
      }}
      variant={'borderless'}
      {...FORM_STYLE}
    />
  );
});

export default ChatGroupSettings;
