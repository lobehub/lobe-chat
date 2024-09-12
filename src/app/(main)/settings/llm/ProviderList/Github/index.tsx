'use client';

import { Input } from 'antd';
import { useTranslation } from 'react-i18next';

import { GithubProviderCard } from '@/config/modelProviders';
import { GlobalLLMProviderKey } from '@/types/user/settings';

import { KeyVaultsConfigKey, LLMProviderApiTokenKey } from '../../const';
import { ProviderItem } from '../../type';

const providerKey: GlobalLLMProviderKey = 'github';

// Same as OpenAIProvider, but replace API Key with Github Personal Access Token
export const useGithubProvider = (): ProviderItem => {
  const { t } = useTranslation('modelProvider');

  return {
    ...GithubProviderCard,
    apiKeyItems: [
      {
        children: (
          <Input.Password
            autoComplete={'new-password'}
            placeholder={t(`${providerKey}.personalAccessToken.placeholder`)}
          />
        ),
        desc: t(`${providerKey}.personalAccessToken.desc`),
        label: t(`${providerKey}.personalAccessToken.title`),
        name: [KeyVaultsConfigKey, providerKey, LLMProviderApiTokenKey],
      },
    ],
  };
};
