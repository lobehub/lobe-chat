'use client';

import { InputPassword, Select } from '@lobehub/ui';
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
          <InputPassword
            autoComplete={'new-password'}
            placeholder={t(`${providerKey}.bearerToken.placeholder`)}
          />
        ),
        desc: t(`${providerKey}.bearerToken.desc`),
        label: t(`${providerKey}.bearerToken.title`),
        name: [KeyVaultsConfigKey, providerKey, 'bearerToken'],
      },
      {
        children: (
          <Select
            allowClear
            options={[
              { label: 'us-east-1', value: 'us-east-1' },
              { label: 'us-west-2', value: 'us-west-2' },
              { label: 'ap-southeast-1', value: 'ap-southeast-1' },
              { label: 'eu-central-1', value: 'eu-central-1' },
            ]}
            placeholder="us-east-1"
          />
        ),
        desc: t(`${providerKey}.region.desc`),
        label: t(`${providerKey}.region.title`),
        name: [KeyVaultsConfigKey, providerKey, 'region'],
      },
    ],
  };
};
