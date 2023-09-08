import { Form, type ItemGroup } from '@lobehub/ui';
import { Form as AntForm, Button, Input } from 'antd';
import isEqual from 'fast-deep-equal';
import { debounce } from 'lodash-es';
import { Webhook } from 'lucide-react';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { FORM_STYLE } from '@/const/layoutTokens';
import { globalSelectors, useGlobalStore } from '@/store/global';

type SettingItemGroup = ItemGroup & {
  children: {
    name?: string | string[];
  }[];
};

const configKey = 'languageModel';

const LLM = memo(() => {
  const { t } = useTranslation('setting');
  const [form] = AntForm.useForm();

  const settings = useGlobalStore(globalSelectors.currentSettings, isEqual);
  const [setSettings] = useGlobalStore((s) => [s.setSettings]);

  const openAI = useMemo<SettingItemGroup>(
    () => ({
      children: [
        {
          children: <Input.Password placeholder={t('llm.OpenAI.token.placeholder')} />,
          desc: t('llm.OpenAI.token.desc'),
          label: t('llm.OpenAI.token.title'),
          name: [configKey, 'openAI', 'OPENAI_API_KEY'],
        },
        {
          children: <Input placeholder={t('llm.OpenAI.endpoint.placeholder')} />,
          desc: t('llm.OpenAI.endpoint.desc'),

          label: t('llm.OpenAI.endpoint.title'),

          name: [configKey, 'openAI', 'endpoint'],
        },
      ],
      icon: Webhook,
      title: t('llm.OpenAI.title'),
    }),
    [settings],
  );

  const azureOpenAI = useMemo<SettingItemGroup>(
    () => ({
      children: [
        {
          children: <Input.Password placeholder={t('llm.AzureOpenAI.token.placeholder')} />,
          desc: t('llm.AzureOpenAI.token.desc'),
          label: t('llm.AzureOpenAI.token.title'),
          name: [configKey, 'azureOpenAI', 'AZURE_API_KEY'],
        },
        {
          children: <Input placeholder={t('llm.AzureOpenAI.endpoint.placeholder')} />,
          desc: t('llm.AzureOpenAI.endpoint.desc'),
          label: t('llm.AzureOpenAI.endpoint.title'),
          name: [configKey, 'azureOpenAI', 'endpoint'],
        },
        {
          children: (
            <Button
              onClick={() => {
                fetch('/api/model-list').then((res) => {
                  res.json().then(console.log);
                });
              }}
            >
              {t('llm.AzureOpenAI.models.fetch')}
            </Button>
          ),
          desc: t('llm.AzureOpenAI.models.desc'),
          label: t('llm.AzureOpenAI.models.title'),
          name: [configKey, 'azureOpenAI', 'models'],
        },
      ],
      icon: Webhook,
      title: t('llm.AzureOpenAI.title'),
    }),
    [settings],
  );

  const items = useMemo(() => [openAI, azureOpenAI], [settings]);

  return (
    <Form
      form={form}
      initialValues={settings}
      items={items}
      onValuesChange={debounce(setSettings, 100)}
      {...FORM_STYLE}
    />
  );
});

export default LLM;
