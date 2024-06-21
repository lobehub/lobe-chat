'use client';

import { Input } from 'antd';
import { useTranslation } from 'react-i18next';

import { CloudflareProviderCard } from '@/config/modelProviders';
import { GlobalLLMProviderKey } from '@/types/user/settings';

import { KeyVaultsConfigKey } from '../../const';
import { ProviderItem } from '../../type';
import { CloudflareBrand } from '../providers';

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
          <Input.Password
            autoComplete={'new-password'}
            placeholder={t(`${providerKey}.accountID.placeholder`)}
          />
        ),
        desc: t(`${providerKey}.accountID.desc`),
        label: t(`${providerKey}.accountID.title`),
        name: [KeyVaultsConfigKey, providerKey, 'accountID'],
      },
    ],
    title: <CloudflareBrand />,
  };
};
