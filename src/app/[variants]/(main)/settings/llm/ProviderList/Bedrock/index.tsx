'use client';

import { Input, Select } from 'antd';
import { useTranslation } from 'react-i18next';

import { BedrockProviderCard } from '@/config/modelProviders';
import { GlobalLLMProviderKey } from '@/types/user/settings';

import { KeyVaultsConfigKey } from '../../const';
import { ProviderItem } from '../../type';

const providerKey: GlobalLLMProviderKey = 'bedrock';

export const useBedrockProvider = (): ProviderItem => {
  const { t } = useTranslation('modelProvider');

  return {
    ...BedrockProviderCard,
    apiKeyItems: [
      {
        children: (
          <Input.Password
            autoComplete={'new-password'}
            placeholder={t(`${providerKey}.accessKeyId.placeholder`)}
          />
        ),
        desc: t(`${providerKey}.accessKeyId.desc`),
        label: t(`${providerKey}.accessKeyId.title`),
        name: [KeyVaultsConfigKey, providerKey, 'accessKeyId'],
      },
      {
        children: (
          <Input.Password
            autoComplete={'new-password'}
            placeholder={t(`${providerKey}.secretAccessKey.placeholder`)}
          />
        ),
        desc: t(`${providerKey}.secretAccessKey.desc`),
        label: t(`${providerKey}.secretAccessKey.title`),
        name: [KeyVaultsConfigKey, providerKey, 'secretAccessKey'],
      },
      {
        children: (
          <Input.Password
            autoComplete={'new-password'}
            placeholder={t(`${providerKey}.sessionToken.placeholder`)}
          />
        ),
        desc: t(`${providerKey}.sessionToken.desc`),
        label: t(`${providerKey}.sessionToken.title`),
        name: [KeyVaultsConfigKey, providerKey, 'sessionToken'],
      },
      {
        children: (
          <Select
            allowClear
            options={['us-east-1', 'us-west-2', 'ap-southeast-1'].map((i) => ({
              label: i,
              value: i,
            }))}
            placeholder={'us-east-1'}
          />
        ),
        desc: t(`${providerKey}.region.desc`),
        label: t(`${providerKey}.region.title`),
        name: [KeyVaultsConfigKey, providerKey, 'region'],
      },
    ],
  };
};
