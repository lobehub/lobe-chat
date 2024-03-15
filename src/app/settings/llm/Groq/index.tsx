import { Groq } from '@lobehub/icons';
import { Input } from 'antd';
import { useTheme } from 'antd-style';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { ModelProvider } from '@/libs/agent-runtime';

import Checker from '../components/Checker';
import ProviderConfig from '../components/ProviderConfig';
import { LLMProviderApiTokenKey, LLMProviderConfigKey } from '../const';

const providerKey = 'groq';

const GroqProvider = memo(() => {
  const { t } = useTranslation('setting');

  const theme = useTheme();

  return (
    <ProviderConfig
      configItems={[
        {
          children: (
            <Input.Password
              autoComplete={'new-password'}
              placeholder={t('llm.Groq.token.placeholder')}
            />
          ),
          desc: t('llm.Groq.token.desc'),
          label: t('llm.Groq.token.title'),
          name: [LLMProviderConfigKey, providerKey, LLMProviderApiTokenKey],
        },
        {
          children: <Checker model={'gemma-7b-it'} provider={ModelProvider.Groq} />,
          desc: t('llm.checker.desc'),
          label: t('llm.checker.title'),
          minWidth: '100%',
        },
      ]}
      provider={providerKey}
      title={<Groq.Text color={theme.isDarkMode ? theme.colorText : Groq.colorPrimary} size={24} />}
    />
  );
});

export default GroqProvider;
