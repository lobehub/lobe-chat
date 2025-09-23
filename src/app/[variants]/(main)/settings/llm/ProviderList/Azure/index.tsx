'use client';

import { AutoComplete, Input, InputPassword, Markdown } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { ModelProvider } from 'model-bank';
import { useTranslation } from 'react-i18next';

import { AzureProviderCard } from '@/config/modelProviders';
import { useUserStore } from '@/store/user';
import { modelProviderSelectors } from '@/store/user/selectors';

import { KeyVaultsConfigKey, LLMProviderApiTokenKey } from '../../const';
import { ProviderItem } from '../../type';

const useStyles = createStyles(({ css, token }) => ({
  markdown: css`
    p {
      color: ${token.colorTextDescription} !important;
    }
  `,
  tip: css`
    font-size: 12px;
    color: ${token.colorTextDescription};
  `,
}));

const providerKey = ModelProvider.Azure;

export const useAzureProvider = (): ProviderItem => {
  const { t } = useTranslation('modelProvider');
  const { styles } = useStyles();

  // Get the first model card's deployment name as the check model
  const checkModel = useUserStore((s) => {
    const chatModelCards = modelProviderSelectors.getModelCardsById(providerKey)(s);

    if (chatModelCards.length > 0) {
      return chatModelCards[0].deploymentName;
    }

    return 'gpt-35-turbo';
  });
  return {
    ...AzureProviderCard,
    apiKeyItems: [
      {
        children: (
          <InputPassword autoComplete={'new-password'} placeholder={t('azure.token.placeholder')} />
        ),
        desc: t('azure.token.desc'),
        label: t('azure.token.title'),
        name: [KeyVaultsConfigKey, providerKey, LLMProviderApiTokenKey],
      },
      {
        children: <Input allowClear placeholder={t('azure.endpoint.placeholder')} />,
        desc: t('azure.endpoint.desc'),
        label: t('azure.endpoint.title'),
        name: [KeyVaultsConfigKey, providerKey, 'endpoint'],
      },
      {
        children: (
          <AutoComplete
            options={[
              '2024-06-01',
              '2024-02-01',
              '2024-05-01-preview',
              '2024-04-01-preview',
              '2024-03-01-preview',
              '2024-02-15-preview',
              '2023-10-01-preview',
              '2023-06-01-preview',
              '2023-05-15',
            ].map((i) => ({ label: i, value: i }))}
            placeholder={'20XX-XX-XX'}
          />
        ),
        desc: (
          <Markdown className={styles.markdown} fontSize={12} variant={'chat'}>
            {t('azure.azureApiVersion.desc')}
          </Markdown>
        ),
        label: t('azure.azureApiVersion.title'),
        name: [KeyVaultsConfigKey, providerKey, 'apiVersion'],
      },
    ],
    checkModel,
    modelList: {
      azureDeployName: true,
      notFoundContent: t('azure.empty'),
      placeholder: t('azure.modelListPlaceholder'),
    },
  };
};
