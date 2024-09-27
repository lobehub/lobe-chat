'use client';

import { Hunyuan } from '@lobehub/icons'; // TODO: 
import { Input } from 'antd';
import { useTranslation } from 'react-i18next';

import { SenseCoreProviderCard } from '@/config/modelProviders';
import { GlobalLLMProviderKey } from '@/types/user/settings';

import { KeyVaultsConfigKey } from '../../const';
import { ProviderItem } from '../../type';

const providerKey: GlobalLLMProviderKey = 'sensecore';

export const useSenseCoreProvider = (): ProviderItem => {
  const { t } = useTranslation('modelProvider');

  return {
    ...SenseCoreProviderCard,
    apiKeyItems: [
      {
        children: (
          <Input.Password
            autoComplete={'new-password'}
            placeholder={t(`${providerKey}.sensecoreAccessKeyID.placeholder`)}
          />
        ),
        desc: t(`${providerKey}.sensecoreAccessKeyID.desc`),
        label: t(`${providerKey}.sensecoreAccessKeyID.title`),
        name: [KeyVaultsConfigKey, providerKey, 'sensecoreAccessKeyID'],
      },
      {
        children: (
          <Input.Password
            autoComplete={'new-password'}
            placeholder={t(`${providerKey}.sensecoreAccessKeySecret.placeholder`)}
          />
        ),
        desc: t(`${providerKey}.sensecoreAccessKeySecret.desc`),
        label: t(`${providerKey}.sensecoreAccessKeySecret.title`),
        name: [KeyVaultsConfigKey, providerKey, 'sensecoreAccessKeySecret'],
      },
    ],
    title: <Hunyuan.Combine size={32} type={'color'} />,
  };
};
