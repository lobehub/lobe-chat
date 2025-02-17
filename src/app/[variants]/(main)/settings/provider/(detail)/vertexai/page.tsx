'use client';

import { Markdown } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { useTranslation } from 'react-i18next';

import { FormPassword } from '@/components/FormInput';
import { VertexAIProviderCard } from '@/config/modelProviders';
import { aiProviderSelectors, useAiInfraStore } from '@/store/aiInfra';
import { GlobalLLMProviderKey } from '@/types/user/settings';

import { KeyVaultsConfigKey, LLMProviderApiTokenKey } from '../../const';
import { SkeletonInput } from '../../features/ProviderConfig';
import { ProviderItem } from '../../type';
import ProviderDetail from '../[id]';

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

const providerKey: GlobalLLMProviderKey = 'vertexai';

// Same as OpenAIProvider, but replace API Key with HuggingFace Access Token
const useProviderCard = (): ProviderItem => {
  const { t } = useTranslation('modelProvider');
  const { styles } = useStyles();
  const isLoading = useAiInfraStore(aiProviderSelectors.isAiProviderConfigLoading(providerKey));

  return {
    ...VertexAIProviderCard,
    apiKeyItems: [
      {
        children: isLoading ? (
          <SkeletonInput />
        ) : (
          <FormPassword
            autoComplete={'new-password'}
            placeholder={t('vertexai.apiKey.placeholder')}
          />
        ),
        desc: (
          <Markdown className={styles.markdown} fontSize={12} variant={'chat'}>
            {t('vertexai.apiKey.desc')}
          </Markdown>
        ),
        label: t('vertexai.apiKey.title'),
        name: [KeyVaultsConfigKey, LLMProviderApiTokenKey],
      },
    ],
  };
};

const Page = () => {
  const card = useProviderCard();

  return <ProviderDetail {...card} />;
};

export default Page;
