'use client';

import { Markdown } from '@lobehub/ui';
import { Input } from 'antd';
import { createStyles } from 'antd-style';
import { useTranslation } from 'react-i18next';

import { ModelScopeProviderCard } from '@/config/modelProviders';
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

const providerKey: GlobalLLMProviderKey = 'modelscope';

// Same as OpenAIProvider, but replace API Key with ModelScope Access Token
export const useModelScopeProvider = (): ProviderItem => {
  const { t } = useTranslation('modelProvider');
  const { styles } = useStyles();

  return {
    ...ModelScopeProviderCard,
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
