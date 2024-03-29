import { ZeroOne } from '@lobehub/icons';
import { Input } from 'antd';
import { useTheme } from 'antd-style';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { ModelProvider } from '@/libs/agent-runtime';

import Checker from '../components/Checker';
import ProviderConfig from '../components/ProviderConfig';
import { LLMProviderApiTokenKey, LLMProviderConfigKey } from '../const';

const providerKey = 'zeroone';

const ZeroOneProvider = memo(() => {
  const { t } = useTranslation('setting');

  const theme = useTheme();

  return (
    <ProviderConfig
      configItems={[
        {
          children: (
            <Input.Password
              autoComplete={'new-password'}
              placeholder={t('llm.ZeroOne.token.placeholder')}
            />
          ),
          desc: t('llm.ZeroOne.token.desc'),
          label: t('llm.ZeroOne.token.title'),
          name: [LLMProviderConfigKey, providerKey, LLMProviderApiTokenKey],
        },
        {
          children: <Checker model={'yi-34b-chat-0205'} provider={ModelProvider.ZeroOne} />,
          desc: t('llm.checker.desc'),
          label: t('llm.checker.title'),
          minWidth: '100%',
        },
      ]}
      provider={providerKey}
      title={
        <ZeroOne.Combine
          color={theme.isDarkMode ? theme.colorText : ZeroOne.colorPrimary}
          size={32}
        />
      }
    />
  );
});

export default ZeroOneProvider;
