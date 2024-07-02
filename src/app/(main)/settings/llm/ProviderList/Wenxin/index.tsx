'use client';

import { Wenxin } from '@lobehub/icons';
import { Input } from 'antd';
import { useTranslation } from 'react-i18next';

import { WenxinProviderCard } from '@/config/modelProviders';
import { GlobalLLMProviderKey } from '@/types/user/settings';

import { KeyVaultsConfigKey } from '../../const';
import { ProviderItem } from '../../type';

const providerKey: GlobalLLMProviderKey = 'wenxin';

export const useWenxinProvider = (): ProviderItem => {
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
    title: <Wenxin.Combine size={32} type={'color'} />,
  };
};
