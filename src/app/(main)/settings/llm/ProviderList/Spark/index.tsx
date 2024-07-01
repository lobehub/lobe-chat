'use client';

import { Spark } from '@lobehub/icons';
import { useTheme } from 'antd-style';

import { Input } from 'antd';
import { useTranslation } from 'react-i18next';

import { SparkProviderCard } from '@/config/modelProviders';
import { GlobalLLMProviderKey } from '@/types/user/settings';

import { KeyVaultsConfigKey } from '../../const';
import { ProviderItem } from '../../type';

const providerKey: GlobalLLMProviderKey = 'spark';

const SparkBrand = () => {
  const theme = useTheme();
  return (
    <Spark.Combine
      color={theme.isDarkMode ? theme.colorText : Spark.colorPrimary}
      size={22}
    />
  );
};

export const useSparkProvider = (): ProviderItem => {
  const { t } = useTranslation('modelProvider');

  return {
    ...SparkProviderCard,
    apiKeyItems: [
      {
        children: (
          <Input.Password
            autoComplete={'new-password'}
            placeholder={t('spark.sparkApiKey.placeholder')}
          />
        ),
        desc: t('spark.sparkApiKey.desc'),
        label: t('spark.sparkApiKey.title'),
        name: [KeyVaultsConfigKey, providerKey, 'sparkApiKey'],
      },
      {
        children: (
          <Input.Password
            autoComplete={'new-password'}
            placeholder={t('spark.sparkApiSecret.placeholder')}
          />
        ),
        desc: t('spark.sparkApiSecret.desc'),
        label: t('spark.sparkApiSecret.title'),
        name: [KeyVaultsConfigKey, providerKey, 'sparkApiSecret'],
      },
    ],
    title: <SparkBrand />,
  };
};
