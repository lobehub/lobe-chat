'use client';

import { Select } from '@lobehub/ui';
import { useTranslation } from 'react-i18next';

import { FormPassword } from '@/components/FormInput';
import { BedrockProviderCard } from '@/config/modelProviders';
import { aiProviderSelectors, useAiInfraStore } from '@/store/aiInfra';
import { GlobalLLMProviderKey } from '@/types/user/settings';

import { KeyVaultsConfigKey } from '../../const';
import { SkeletonInput } from '../../features/ProviderConfig';
import { ProviderItem } from '../../type';
import ProviderDetail from '../[id]';

const providerKey: GlobalLLMProviderKey = 'bedrock';

const useBedrockCard = (): ProviderItem => {
  const { t } = useTranslation('modelProvider');

  const isLoading = useAiInfraStore(aiProviderSelectors.isAiProviderConfigLoading(providerKey));

  return {
    ...BedrockProviderCard,
    apiKeyItems: [
      {
        children: isLoading ? (
          <SkeletonInput />
        ) : (
          <FormPassword
            autoComplete={'new-password'}
            placeholder={t(`${providerKey}.accessKeyId.placeholder`)}
          />
        ),
        desc: t(`${providerKey}.accessKeyId.desc`),
        label: t(`${providerKey}.accessKeyId.title`),
        name: [KeyVaultsConfigKey, 'accessKeyId'],
      },
      {
        children: isLoading ? (
          <SkeletonInput />
        ) : (
          <FormPassword
            autoComplete={'new-password'}
            placeholder={t(`${providerKey}.secretAccessKey.placeholder`)}
          />
        ),
        desc: t(`${providerKey}.secretAccessKey.desc`),
        label: t(`${providerKey}.secretAccessKey.title`),
        name: [KeyVaultsConfigKey, 'secretAccessKey'],
      },
      {
        children: isLoading ? (
          <SkeletonInput />
        ) : (
          <FormPassword
            autoComplete={'new-password'}
            placeholder={t(`${providerKey}.sessionToken.placeholder`)}
          />
        ),
        desc: t(`${providerKey}.sessionToken.desc`),
        label: t(`${providerKey}.sessionToken.title`),
        name: [KeyVaultsConfigKey, 'sessionToken'],
      },
      {
        children: isLoading ? (
          <SkeletonInput />
        ) : (
          <Select
            allowClear
            options={['us-east-1', 'us-west-2', 'ap-southeast-1', 'eu-central-1'].map((i) => ({
              label: i,
              value: i,
            }))}
            placeholder={'us-east-1'}
          />
        ),
        desc: t(`${providerKey}.region.desc`),
        label: t(`${providerKey}.region.title`),
        name: [KeyVaultsConfigKey, 'region'],
      },
    ],
  };
};

const Page = () => {
  const card = useBedrockCard();

  return <ProviderDetail {...card} />;
};

export default Page;
