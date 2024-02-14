import { Moonshot } from '@lobehub/icons';
import { Input } from 'antd';
import { useTheme } from 'antd-style';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { ModelProvider } from '@/libs/agent-runtime';

import Checker from '../components/Checker';
import ProviderConfig from '../components/ProviderConfig';
import { LLMProviderApiTokenKey, LLMProviderConfigKey } from '../const';

const providerKey = 'moonshot';

const MoonshotProvider = memo(() => {
  const { t } = useTranslation('setting');

  const theme = useTheme();

  return (
    <ProviderConfig
      configItems={[
        {
          children: (
            <Input.Password
              autoComplete={'new-password'}
              placeholder={t('llm.Moonshot.token.placeholder')}
            />
          ),
          desc: t('llm.Moonshot.token.desc'),
          label: t('llm.Moonshot.token.title'),
          name: [LLMProviderConfigKey, providerKey, LLMProviderApiTokenKey],
        },
        {
          children: <Checker model={'moonshot-v1-8k'} provider={ModelProvider.Moonshot} />,
          desc: t('llm.checker.desc'),
          label: t('llm.checker.title'),
          minWidth: '100%',
        },
      ]}
      provider={providerKey}
      title={
        <Moonshot.Combine
          color={theme.isDarkMode ? theme.colorText : Moonshot.colorPrimary}
          size={24}
        />
      }
    />
  );
});

export default MoonshotProvider;
