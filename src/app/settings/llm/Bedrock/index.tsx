import { Aws, Bedrock } from '@lobehub/icons';
import { Divider, Input, Select } from 'antd';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { ModelProvider } from '@/libs/agent-runtime';
import { GlobalLLMProviderKey } from '@/types/settings';

import Checker from '../components/Checker';
import ProviderConfig from '../components/ProviderConfig';
import { LLMProviderConfigKey } from '../const';

const providerKey: GlobalLLMProviderKey = 'bedrock';

const BedrockProvider = memo(() => {
  const { t } = useTranslation('setting');

  return (
    <ProviderConfig
      configItems={[
        {
          children: (
            <Input.Password
              autoComplete={'new-password'}
              placeholder={t(`llm.${providerKey}.accessKeyId.placeholder`)}
            />
          ),
          desc: t(`llm.${providerKey}.accessKeyId.desc`),
          label: t(`llm.${providerKey}.accessKeyId.title`),
          name: [LLMProviderConfigKey, providerKey, 'accessKeyId'],
        },
        {
          children: (
            <Input.Password
              autoComplete={'new-password'}
              placeholder={t(`llm.${providerKey}.secretAccessKey.placeholder`)}
            />
          ),
          desc: t(`llm.${providerKey}.secretAccessKey.desc`),
          label: t(`llm.${providerKey}.secretAccessKey.title`),
          name: [LLMProviderConfigKey, providerKey, 'secretAccessKey'],
        },
        {
          children: (
            <Select
              allowClear
              options={['us-east-1', 'us-west-2', 'ap-southeast-1'].map((i) => ({
                label: i,
                value: i,
              }))}
              placeholder={'us-east-1'}
            />
          ),
          desc: t(`llm.${providerKey}.region.desc`),
          label: t(`llm.${providerKey}.region.title`),
          name: [LLMProviderConfigKey, providerKey, 'region'],
        },
        {
          children: (
            <Checker model={'anthropic.claude-instant-v1'} provider={ModelProvider.Bedrock} />
          ),
          desc: t(`llm.${providerKey}.checker.desc`),
          label: t('llm.checker.title'),
          minWidth: '100%',
        },
      ]}
      provider={providerKey}
      title={
        <Flexbox align={'center'} gap={8} horizontal>
          <Aws.Color size={32} />
          <Divider style={{ margin: '0 4px' }} type={'vertical'} />
          <Bedrock.Combine size={24} type={'color'} />
        </Flexbox>
      }
    />
  );
});

export default BedrockProvider;
