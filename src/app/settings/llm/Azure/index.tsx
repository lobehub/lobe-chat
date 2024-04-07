import { Azure, OpenAI } from '@lobehub/icons';
import { Markdown } from '@lobehub/ui';
import { AutoComplete, Divider, Input } from 'antd';
import { createStyles } from 'antd-style';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { ModelProvider } from '@/libs/agent-runtime';

import Checker from '../components/Checker';
import ProviderConfig from '../components/ProviderConfig';
import { LLMProviderApiTokenKey, LLMProviderBaseUrlKey, LLMProviderConfigKey } from '../const';

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

const providerKey = 'azure';

const AzureOpenAIProvider = memo(() => {
  const { t } = useTranslation('setting');

  const { styles } = useStyles();

  return (
    <ProviderConfig
      configItems={[
        {
          children: (
            <Input.Password
              autoComplete={'new-password'}
              placeholder={t('llm.azure.token.placeholder')}
            />
          ),
          desc: t('llm.azure.token.desc'),
          label: t('llm.azure.token.title'),
          name: [LLMProviderConfigKey, providerKey, LLMProviderApiTokenKey],
        },
        {
          children: <Input allowClear placeholder={t('llm.azure.endpoint.placeholder')} />,
          desc: t('llm.azure.endpoint.desc'),
          label: t('llm.azure.endpoint.title'),
          name: [LLMProviderConfigKey, providerKey, LLMProviderBaseUrlKey],
        },
        {
          children: (
            <AutoComplete
              options={[
                '2023-12-01-preview',
                '2023-08-01-preview',
                '2023-07-01-preview',
                '2023-06-01-preview',
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
              {t('llm.azure.azureApiVersion.desc')}
            </Markdown>
          ),
          label: t('llm.azure.azureApiVersion.title'),
          name: [LLMProviderConfigKey, providerKey, 'apiVersion'],
        },
        {
          children: (
            <Input.TextArea
              allowClear
              placeholder={'gpt-35-16k,my-gpt=gpt-35-turbo'}
              style={{ height: 100 }}
            />
          ),
          desc: (
            <Markdown className={styles.markdown} fontSize={12} variant={'chat'}>
              {t('llm.azure.deployments.desc')}
            </Markdown>
          ),

          label: t('llm.azure.deployments.title'),
          name: [LLMProviderConfigKey, providerKey, 'deployments'],
        },
        {
          children: <Checker model={'gpt-3.5-turbo'} provider={ModelProvider.Azure} />,
          desc: t('llm.checker.desc'),
          label: t('llm.checker.title'),
          minWidth: undefined,
        },
      ]}
      provider={providerKey}
      title={
        <Flexbox align={'center'} gap={8} horizontal>
          <Azure.Combine size={24} type={'color'}></Azure.Combine>
          <Divider style={{ margin: '0 4px' }} type={'vertical'} />
          <OpenAI.Combine size={24}></OpenAI.Combine>
        </Flexbox>
      }
    />
  );
});

export default AzureOpenAIProvider;
