import { Google } from '@lobehub/icons';
import { Input } from 'antd';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { ModelProvider } from '@/libs/agent-runtime';
import { GlobalLLMProviderKey } from '@/types/settings';

import Checker from '../components/Checker';
import ProviderConfig from '../components/ProviderConfig';
import { LLMProviderApiTokenKey, LLMProviderConfigKey } from '../const';

const providerKey: GlobalLLMProviderKey = 'google';

const GoogleProvider = memo(() => {
  const { t } = useTranslation('setting');

  return (
    <ProviderConfig
      configItems={[
        {
          children: (
            <Input.Password
              autoComplete={'new-password'}
              placeholder={t('llm.Google.token.placeholder')}
            />
          ),
          desc: t('llm.Google.token.desc'),
          label: t('llm.Google.token.title'),
          name: [LLMProviderConfigKey, providerKey, LLMProviderApiTokenKey],
        },
        {
          children: <Checker model={'gemini-pro'} provider={ModelProvider.Google} />,
          desc: t('llm.checker.desc'),
          label: t('llm.checker.title'),
          minWidth: '100%',
        },
      ]}
      provider={providerKey}
      title={<Google.BrandColor size={28} />}
    />
  );
});

export default GoogleProvider;
