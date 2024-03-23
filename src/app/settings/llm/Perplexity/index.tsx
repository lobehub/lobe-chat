import { Perplexity } from '@lobehub/icons';
import { Input } from 'antd';
import { useTheme } from 'antd-style';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { ModelProvider } from '@/libs/agent-runtime';

import Checker from '../components/Checker';
import ProviderConfig from '../components/ProviderConfig';
import { LLMProviderApiTokenKey, LLMProviderConfigKey } from '../const';

const providerKey = 'perplexity';

const PerplexityProvider = memo(() => {
  const { t } = useTranslation('setting');

  const theme = useTheme();

  return (
    <ProviderConfig
      configItems={[
        {
          children: (
            <Input.Password
              autoComplete={'new-password'}
              placeholder={t('llm.Perplexity.token.placeholder')}
            />
          ),
          desc: t('llm.Perplexity.token.desc'),
          label: t('llm.Perplexity.token.title'),
          name: [LLMProviderConfigKey, providerKey, LLMProviderApiTokenKey],
        },
        {
          children: <Checker model={'pplx-7b-chat'} provider={ModelProvider.Perplexity} />,
          desc: t('llm.checker.desc'),
          label: t('llm.checker.title'),
          minWidth: '100%',
        },
      ]}
      provider={providerKey}
      title={
        <Perplexity.Combine
          color={theme.isDarkMode ? theme.colorText : Perplexity.colorPrimary}
          size={24}
        />
      }
    />
  );
});

export default PerplexityProvider;
