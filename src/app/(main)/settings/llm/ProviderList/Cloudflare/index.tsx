'use client';

import { Input } from 'antd';
import { useTranslation } from 'react-i18next';

import { CloudflareProviderCard } from '@/config/modelProviders';
import { GlobalLLMProviderKey } from '@/types/user/settings';

import { KeyVaultsConfigKey } from '../../const';
import { ProviderItem } from '../../type';

const providerKey: GlobalLLMProviderKey = 'cloudflare';

export const useCloudflareProvider = (): ProviderItem => {
  const { t } = useTranslation('modelProvider');

  return {
    ...CloudflareProviderCard,
    apiKeyItems: [
      {
        children: (
          <Input.Password
            autoComplete={'new-password'}
            placeholder={t(`${providerKey}.apiKey.placeholder`)}
          />
        ),
        desc: t(`${providerKey}.apiKey.desc`),
        label: t(`${providerKey}.apiKey.title`),
        name: [KeyVaultsConfigKey, providerKey, 'apiKey'],
      },
      {
        children: (
          <Input
            placeholder={t(`${providerKey}.baseURLOrAccountID.placeholder`)}
          />
        ),
        desc: t(`${providerKey}.baseURLOrAccountID.desc`),
        label: t(`${providerKey}.baseURLOrAccountID.title`),
        name: [KeyVaultsConfigKey, providerKey, 'baseURLOrAccountID'],
      },
    ],
  };
};
