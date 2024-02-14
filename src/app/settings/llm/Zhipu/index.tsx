import { Zhipu } from '@lobehub/icons';
import { Input } from 'antd';
import { useTheme } from 'antd-style';
import { lighten } from 'polished';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { ModelProvider } from '@/libs/agent-runtime';

import Checker from '../components/Checker';
import ProviderConfig from '../components/ProviderConfig';
import { LLMProviderApiTokenKey, LLMProviderConfigKey } from '../const';

const providerKey = 'zhipu';

const ZhipuProvider = memo(() => {
  const { t } = useTranslation('setting');

  const theme = useTheme();

  return (
    <ProviderConfig
      configItems={[
        {
          children: (
            <Input.Password
              autoComplete={'new-password'}
              placeholder={t('llm.Zhipu.token.placeholder')}
            />
          ),
          desc: t('llm.Zhipu.token.desc'),
          label: t('llm.Zhipu.token.title'),
          name: [LLMProviderConfigKey, providerKey, LLMProviderApiTokenKey],
        },
        {
          children: <Checker model={'glm-3-turbo'} provider={ModelProvider.ZhiPu} />,
          desc: t('llm.checker.desc'),
          label: t('llm.checker.title'),
          minWidth: '100%',
        },
      ]}
      provider={providerKey}
      title={
        <Zhipu.Combine
          color={theme.isDarkMode ? lighten(0.1, Zhipu.colorPrimary) : Zhipu.colorPrimary}
          size={32}
        />
      }
    />
  );
});

export default ZhipuProvider;
