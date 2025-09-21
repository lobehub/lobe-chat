import { Form, type FormGroupItemType } from '@lobehub/ui';
import { Input, InputNumber, Switch } from 'antd';
import isEqual from 'fast-deep-equal';
import { MessageCircle } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { FORM_STYLE } from '@/const/layoutTokens';

import { selectors, useStore } from '../store';

const AUTO_SUGGESTION_SETTING_KEY = 'autoSuggestion';

const AgentAutoSuggestion = memo(() => {
  const { t } = useTranslation('setting');
  const [form] = Form.useForm();

  const config = useStore(selectors.currentAgentConfig, isEqual);
  const updateConfig = useStore((s) => s.setAgentConfig);

  const autoSuggestion: FormGroupItemType = {
    children: [
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
        children: <InputNumber max={5} min={1} style={{ width: '100%' }} />,
        desc: t('agent.autoSuggestion.maxSuggestions.desc'),
        hidden: !config.chatConfig.autoSuggestion?.enabled,
        label: t('agent.autoSuggestion.maxSuggestions.title'),
        name: [AUTO_SUGGESTION_SETTING_KEY, 'maxSuggestions'],
      },
      {
        children: (
          <Input.TextArea
            placeholder={t('agent.autoSuggestion.customPrompt.placeholder')}
            rows={4}
          />
        ),
        desc: t('agent.autoSuggestion.customPrompt.desc'),
        hidden: !config.chatConfig.autoSuggestion?.enabled,
        label: t('agent.autoSuggestion.customPrompt.title'),
        name: [AUTO_SUGGESTION_SETTING_KEY, 'customPrompt'],
      },
    ],
    icon: MessageCircle,
    title: t('agent.autoSuggestion.title'),
  };

  return (
    <Form
      footer={
        <Form.SubmitFooter
          texts={{
            reset: t('submitFooter.reset'),
            submit: t('agent.autoSuggestion.submit'),
            unSaved: t('submitFooter.unSaved'),
            unSavedWarning: t('submitFooter.unSavedWarning'),
          }}
        />
      }
      form={form}
      initialValues={{
        [AUTO_SUGGESTION_SETTING_KEY]: {
          customPrompt: '',
          enabled: false,
          maxSuggestions: 3,
          ...config.chatConfig.autoSuggestion,
        },
      }}
      items={[autoSuggestion]}
      itemsType={'group'}
      onFinish={updateConfig}
      variant={'borderless'}
      {...FORM_STYLE}
    />
  );
});

export default AgentAutoSuggestion;
