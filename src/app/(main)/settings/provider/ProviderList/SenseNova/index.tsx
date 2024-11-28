'use client';

import { Input } from 'antd';
import { useTranslation } from 'react-i18next';

import { SenseNovaProviderCard } from '@/config/modelProviders';
import { GlobalLLMProviderKey } from '@/types/user/settings';

import { KeyVaultsConfigKey } from '../../const';
import { ProviderItem } from '../../type';

const providerKey: GlobalLLMProviderKey = 'sensenova';

export const useSenseNovaProvider = (): ProviderItem => {
  const { t } = useTranslation('modelProvider');

  return {
    ...SenseNovaProviderCard,
    apiKeyItems: [
      {
        children: (
          <Input.Password
            autoComplete={'new-password'}
            placeholder={t(`${providerKey}.sensenovaAccessKeyID.placeholder`)}
          />
        ),
        desc: t(`${providerKey}.sensenovaAccessKeyID.desc`),
        label: t(`${providerKey}.sensenovaAccessKeyID.title`),
        name: [KeyVaultsConfigKey, providerKey, 'sensenovaAccessKeyID'],
      },
      {
        children: (
          <Input.Password
            autoComplete={'new-password'}
            placeholder={t(`${providerKey}.sensenovaAccessKeySecret.placeholder`)}
          />
        ),
        desc: t(`${providerKey}.sensenovaAccessKeySecret.desc`),
        label: t(`${providerKey}.sensenovaAccessKeySecret.title`),
        name: [KeyVaultsConfigKey, providerKey, 'sensenovaAccessKeySecret'],
      },
    ],
  };
};
