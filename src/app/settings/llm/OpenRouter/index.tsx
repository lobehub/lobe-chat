import { OpenRouter } from '@lobehub/icons';
import { Input } from 'antd';
import { useTheme } from 'antd-style';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { ModelProvider } from '@/libs/agent-runtime';

import Checker from '../components/Checker';
import ProviderConfig from '../components/ProviderConfig';
import { LLMProviderApiTokenKey, LLMProviderConfigKey } from '../const';

const providerKey = 'openrouter';

const OpenRouterProvider = memo(() => {
  const { t } = useTranslation('setting');

  const theme = useTheme();

  return (
    <ProviderConfig
      configItems={[
        {
          children: (
            <Input.Password
              autoComplete={'new-password'}
              placeholder={t('llm.OpenRouter.token.placeholder')}
            />
          ),
          desc: t('llm.OpenRouter.token.desc'),
          label: t('llm.OpenRouter.token.title'),
          name: [LLMProviderConfigKey, providerKey, LLMProviderApiTokenKey],
        },
        {
          children: (
            <Input.TextArea
              allowClear
              placeholder={t('llm.OpenRouter.customModelName.placeholder')}
              style={{ height: 100 }}
            />
          ),
          desc: t('llm.OpenRouter.customModelName.desc'),
          label: t('llm.OpenRouter.customModelName.title'),
          name: [LLMProviderConfigKey, providerKey, 'customModelName'],
        },
        {
          children: <Checker model={'mistralai/mistral-7b-instruct:free'} provider={ModelProvider.OpenRouter} />,
          desc: t('llm.checker.desc'),
          label: t('llm.checker.title'),
          minWidth: '100%',
        },
      ]}
      provider={providerKey}
      title={
        <OpenRouter.Combine
          color={theme.isDarkMode ? theme.colorText : OpenRouter.colorPrimary}
          size={24}
        />
      }
    />
  );
});

export default OpenRouterProvider;
