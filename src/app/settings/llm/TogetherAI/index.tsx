import { Input } from 'antd';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { ModelProvider } from '@/libs/agent-runtime';

import Checker from '../components/Checker';
import ProviderConfig from '../components/ProviderConfig';
import { LLMProviderApiTokenKey, LLMProviderConfigKey } from '../const';

const providerKey = 'togetherai';

const TogetherAIProvider = memo(() => {
  const { t } = useTranslation('setting');

  // TODO: add icon for TogetherAI
  // const theme = useTheme();

  return (
    <ProviderConfig
      configItems={[
        {
          children: (
            <Input.Password
              autoComplete={'new-password'}
              placeholder={t('llm.TogetherAI.token.placeholder')}
            />
          ),
          desc: t('llm.TogetherAI.token.desc'),
          label: t('llm.TogetherAI.token.title'),
          name: [LLMProviderConfigKey, providerKey, LLMProviderApiTokenKey],
        },
        {
          children: (
            <Input.TextArea
              allowClear
              placeholder={t('llm.TogetherAI.customModelName.placeholder')}
              style={{ height: 100 }}
            />
          ),
          desc: t('llm.TogetherAI.customModelName.desc'),
          label: t('llm.TogetherAI.customModelName.title'),
          name: [LLMProviderConfigKey, providerKey, 'customModelName'],
        },
        {
          children: (
            <Checker model={'togethercomputer/alpaca-7b'} provider={ModelProvider.TogetherAI} />
          ),
          desc: t('llm.checker.desc'),
          label: t('llm.checker.title'),
          minWidth: '100%',
        },
      ]}
      provider={providerKey}
      //TODO: add icon for TogetherAI
      title="TogetherAI"
    />
  );
});

export default TogetherAIProvider;
