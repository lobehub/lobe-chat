'use client';

import { Input } from 'antd';
import { useTranslation } from 'react-i18next';

import ProviderConfig from '@/app/(main)/settings/provider/components/ProviderConfig';
import { WenxinProviderCard } from '@/config/modelProviders';
import { GlobalLLMProviderKey } from '@/types/user/settings';

import { KeyVaultsConfigKey } from '../../const';
import { ProviderItem } from '../../type';

const providerKey: GlobalLLMProviderKey = 'wenxin';

const useProviderCard = (): ProviderItem => {
  const { t } = useTranslation('modelProvider');

  return {
    ...WenxinProviderCard,
    apiKeyItems: [
      {
        children: (
          <Input.Password
            autoComplete={'new-password'}
            placeholder={t(`${providerKey}.accessKey.placeholder`)}
          />
        ),
        desc: t(`${providerKey}.accessKey.desc`),
        label: t(`${providerKey}.accessKey.title`),
        name: [KeyVaultsConfigKey, providerKey, 'accessKey'],
      },
      {
        children: (
          <Input.Password
            autoComplete={'new-password'}
            placeholder={t(`${providerKey}.secretKey.placeholder`)}
          />
        ),
        desc: t(`${providerKey}.secretKey.desc`),
        label: t(`${providerKey}.secretKey.title`),
        name: [KeyVaultsConfigKey, providerKey, 'secretKey'],
      },
    ],
  };
};

const Page = () => {
  const card = useProviderCard();

  return <ProviderConfig {...card} />;
};

export default Page;
