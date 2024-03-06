import { Anthropic } from '@lobehub/icons';
import { Input } from 'antd';
import { useTheme } from 'antd-style';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { ModelProvider } from '@/libs/agent-runtime';

import Checker from '../components/Checker';
import ProviderConfig from '../components/ProviderConfig';
import { LLMProviderApiTokenKey, LLMProviderConfigKey } from '../const';

const providerKey = 'anthropic';

const AnthropicProvider = memo(() => {
  const { t } = useTranslation('setting');

  const theme = useTheme();

  return (
    <ProviderConfig
      configItems={[
        {
          children: (
            <Input.Password
              autoComplete={'new-password'}
              placeholder={t('llm.Anthropic.token.placeholder')}
            />
          ),
          desc: t('llm.Anthropic.token.desc'),
          label: t('llm.Anthropic.token.title'),
          name: [LLMProviderConfigKey, providerKey, LLMProviderApiTokenKey],
        },
        {
          children: <Checker model={'claude-2.1'} provider={ModelProvider.Anthropic} />,
          desc: t('llm.checker.desc'),
          label: t('llm.checker.title'),
          minWidth: '100%',
        },
      ]}
      provider={providerKey}
      title={
        <Anthropic.Text
          color={theme.isDarkMode ? theme.colorText : Anthropic.colorPrimary}
          size={18}
        />
      }
    />
  );
});

export default AnthropicProvider;
