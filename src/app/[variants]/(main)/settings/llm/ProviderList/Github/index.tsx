'use client';

import { InputPassword, Markdown } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { useTranslation } from 'react-i18next';

import { GithubProviderCard } from '@/config/modelProviders';
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

const providerKey: GlobalLLMProviderKey = 'github';

// Same as OpenAIProvider, but replace API Key with Github Personal Access Token
export const useGithubProvider = (): ProviderItem => {
  const { t } = useTranslation('modelProvider');
  const { styles } = useStyles();

  return {
    ...GithubProviderCard,
    apiKeyItems: [
      {
        children: (
          <InputPassword
            autoComplete={'new-password'}
            placeholder={t(`${providerKey}.personalAccessToken.placeholder`)}
          />
        ),
        desc: (
          <Markdown className={styles.markdown} fontSize={12} variant={'chat'}>
            {t(`${providerKey}.personalAccessToken.desc`)}
          </Markdown>
        ),
        label: t(`${providerKey}.personalAccessToken.title`),
        name: [KeyVaultsConfigKey, providerKey, LLMProviderApiTokenKey],
      },
    ],
  };
};
