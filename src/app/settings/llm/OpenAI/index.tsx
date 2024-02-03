import { OpenAI } from '@lobehub/icons';
import { Form, type ItemGroup } from '@lobehub/ui';
import { Form as AntForm, Input } from 'antd';
import { debounce } from 'lodash-es';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { LLMProviderConfigKey } from '@/app/settings/llm/const';
import { useSyncSettings } from '@/app/settings/llm/useSyncSettings';
import { FORM_STYLE } from '@/const/layoutTokens';
import { ModelProvider } from '@/libs/agent-runtime';
import { useGlobalStore } from '@/store/global';

import Checker from '../Checker';

const providerKey = 'openAI';

const LLM = memo(() => {
  const { t } = useTranslation('setting');
  const [form] = AntForm.useForm();

  const [setSettings] = useGlobalStore((s) => [s.setSettings]);

  useSyncSettings(form);

  const openAI: ItemGroup = {
    children: [
      {
        children: (
          <Input.Password
            autoComplete={'new-password'}
            placeholder={t('llm.OpenAI.token.placeholder')}
          />
        ),
        desc: t('llm.OpenAI.token.desc'),
        label: t('llm.OpenAI.token.title'),
        name: [LLMProviderConfigKey, providerKey, 'OPENAI_API_KEY'],
      },
      {
        children: <Input allowClear placeholder={t('llm.OpenAI.endpoint.placeholder')} />,
        desc: t('llm.OpenAI.endpoint.desc'),
        label: t('llm.OpenAI.endpoint.title'),
        name: [LLMProviderConfigKey, providerKey, 'endpoint'],
      },
      {
        children: (
          <Input.TextArea
            allowClear
            placeholder={t('llm.OpenAI.customModelName.placeholder')}
            style={{ height: 100 }}
          />
        ),
        desc: t('llm.OpenAI.customModelName.desc'),
        label: t('llm.OpenAI.customModelName.title'),
        name: [LLMProviderConfigKey, providerKey, 'customModelName'],
      },
      {
        children: <Checker model={'gpt-3.5-turbo'} provider={ModelProvider.OpenAI} />,
        desc: t('llm.checker.desc'),
        label: t('llm.checker.title'),
        minWidth: '100%',
      },
    ],
    title: (
      <Flexbox align={'center'} gap={8} horizontal>
        <OpenAI.Combine size={24}></OpenAI.Combine>
      </Flexbox>
    ),
  };

  return (
    <Form
      form={form}
      items={[openAI]}
      onValuesChange={debounce(setSettings, 100)}
      {...FORM_STYLE}
    />
  );
});

export default LLM;
