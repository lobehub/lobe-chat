'use client';

import { Markdown } from '@lobehub/ui';
import { Input } from 'antd';
import { createStyles } from 'antd-style';
import { useTranslation } from 'react-i18next';

import { HuggingFaceProviderCard } from '@/config/modelProviders';
import { GlobalLLMProviderKey } from '@/types/user/settings';

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

const providerKey: GlobalLLMProviderKey = 'huggingface';

// Same as OpenAIProvider, but replace API Key with HuggingFace Access Token
export const useHuggingFaceProvider = (): ProviderItem => {
  const { t } = useTranslation('modelProvider');
  const { styles } = useStyles();

  return {
    ...HuggingFaceProviderCard,
    apiKeyItems: [
      {
        children: (
          <Input.Password
            autoComplete={'new-password'}
            placeholder={t(`${providerKey}.accessToken.placeholder`)}
          />
        ),
        desc: (
          <Markdown className={styles.markdown} fontSize={12} variant={'chat'}>
            {t(`${providerKey}.accessToken.desc`)}
          </Markdown>
        ),
        label: t(`${providerKey}.accessToken.title`),
        name: [KeyVaultsConfigKey, providerKey, LLMProviderApiTokenKey],
      },
    ],
  };
};
