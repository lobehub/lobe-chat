'use client';

import { Input } from 'antd';
import { useTranslation } from 'react-i18next';

import { WenxinProviderCard } from '@/config/modelProviders';
import { aiProviderSelectors, useAiInfraStore } from '@/store/aiInfra';
import { GlobalLLMProviderKey } from '@/types/user/settings';

import { KeyVaultsConfigKey } from '../../const';
import { SkeletonInput } from '../../features/ProviderConfig';
import { ProviderItem } from '../../type';
import ProviderDetail from '../[id]';

const providerKey: GlobalLLMProviderKey = 'wenxin';

const useProviderCard = (): ProviderItem => {
  const { t } = useTranslation('modelProvider');

  const isLoading = useAiInfraStore(aiProviderSelectors.isAiProviderConfigLoading(providerKey));

  return {
    ...WenxinProviderCard,
    apiKeyItems: [
      {
        children: isLoading ? (
          <SkeletonInput />
        ) : (
          <Input.Password
            autoComplete={'new-password'}
            placeholder={t(`${providerKey}.accessKey.placeholder`)}
          />
        ),
        desc: t(`${providerKey}.accessKey.desc`),
        label: t(`${providerKey}.accessKey.title`),
        name: [KeyVaultsConfigKey, 'accessKey'],
      },
      {
        children: isLoading ? (
          <SkeletonInput />
        ) : (
          <Input.Password
            autoComplete={'new-password'}
            placeholder={t(`${providerKey}.secretKey.placeholder`)}
          />
        ),
        desc: t(`${providerKey}.secretKey.desc`),
        label: t(`${providerKey}.secretKey.title`),
        name: [KeyVaultsConfigKey, 'secretKey'],
      },
    ],
  };
};

const Page = () => {
  const card = useProviderCard();

  return <ProviderDetail {...card} />;
};

export default Page;
