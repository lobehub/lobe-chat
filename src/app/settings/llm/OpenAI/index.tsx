import { OpenAI } from '@lobehub/icons';
import { Markdown } from '@lobehub/ui';
import { AutoComplete, Input, Switch } from 'antd';
import { createStyles } from 'antd-style';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { ModelProvider } from '@/libs/agent-runtime';
import { useGlobalStore } from '@/store/global';
import { modelProviderSelectors } from '@/store/global/selectors';

import Checker from '../components/Checker';
import ProviderConfig from '../components/ProviderConfig';
import { LLMProviderConfigKey } from '../const';

const useStyles = createStyles(({ css, token }) => ({
  markdown: css`
    p {
      color: ${token.colorTextDescription} !important;
    }
  `,
  tip: css`
    font-size: 12px;
    color: ${token.colorTextDescription};
  `,
}));
const providerKey = 'openAI';

const LLM = memo(() => {
  const { t } = useTranslation('setting');
  const { styles } = useStyles();

  const [useAzure] = useGlobalStore((s) => [modelProviderSelectors.enableAzure(s)]);

  return (
    <ProviderConfig
      canDeactivate={false}
      configItems={[
        {
          children: (
            <Input.Password
              autoComplete={'new-password'}
              placeholder={
                useAzure ? t('llm.azure.token.placeholder') : t('llm.openai.token.placeholder')
              }
            />
          ),
          desc: useAzure ? t('llm.azure.token.desc') : t('llm.openai.token.desc'),
          label: useAzure ? t('llm.azure.token.title') : t('llm.openai.token.title'),
          name: [LLMProviderConfigKey, providerKey, 'OPENAI_API_KEY'],
        },
        {
          children: (
            <Input
              allowClear
              placeholder={
                useAzure
                  ? t('llm.azure.endpoint.placeholder')
                  : t('llm.openai.endpoint.placeholder')
              }
            />
          ),
          desc: useAzure ? t('llm.azure.endpoint.desc') : t('llm.openai.endpoint.desc'),
          label: useAzure ? t('llm.azure.endpoint.title') : t('llm.openai.endpoint.title'),
          name: [LLMProviderConfigKey, providerKey, 'endpoint'],
        },
        {
          children: (
            <Input.TextArea
              allowClear
              placeholder={t('llm.openai.customModelName.placeholder')}
              style={{ height: 100 }}
            />
          ),
          desc: t('llm.openai.customModelName.desc'),
          label: t('llm.openai.customModelName.title'),
          name: [LLMProviderConfigKey, providerKey, 'customModelName'],
        },
        {
          children: <Switch />,
          desc: t('llm.openai.useAzure.desc'),
          label: t('llm.openai.useAzure.title'),
          minWidth: undefined,
          name: [LLMProviderConfigKey, 'openAI', 'useAzure'],
          valuePropName: 'checked',
        },
        {
          children: (
            <AutoComplete
              options={[
                '2024-02-15-preview',
                '2023-12-01-preview',
                '2023-08-01-preview',
                '2023-07-01-preview',
                '2023-06-01-preview',
                '2023-05-15',
                '2023-03-15-preview',
              ].map((i) => ({
                label: i,
                value: i,
              }))}
              placeholder={'20XX-XX-XX'}
            />
          ),
          desc: (
            <Markdown className={styles.markdown} fontSize={12} variant={'chat'}>
              {t('llm.openai.azureApiVersion.desc')}
            </Markdown>
          ),
          hidden: !useAzure,
          label: t('llm.openai.azureApiVersion.title'),
          name: [LLMProviderConfigKey, providerKey, 'azureApiVersion'],
        },
        {
          children: <Checker model={'gpt-3.5-turbo'} provider={ModelProvider.OpenAI} />,
          desc: t('llm.checker.desc'),
          label: t('llm.checker.title'),
          minWidth: '100%',
        },
      ]}
      provider={providerKey}
      title={<OpenAI.Combine size={24} />}
    />
  );
});

export default LLM;
