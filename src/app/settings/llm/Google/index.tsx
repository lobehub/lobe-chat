import { Google, Gemini } from '@lobehub/icons';
import { Input, Divider } from 'antd';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { ModelProvider } from '@/libs/agent-runtime';
import { GlobalLLMProviderKey } from '@/types/settings';

import Checker from '../components/Checker';
import ProviderConfig from '../components/ProviderConfig';
import { LLMProviderApiTokenKey, LLMProviderConfigKey } from '../const';

const providerKey: GlobalLLMProviderKey = 'google';

const GoogleProvider = memo(() => {
  const { t } = useTranslation('setting');

  return (
    <ProviderConfig
      configItems={[
        {
          children: (
            <Input.Password
              autoComplete={'new-password'}
              placeholder={t('llm.Google.token.placeholder')}
            />
          ),
          desc: t('llm.Google.token.desc'),
          label: t('llm.Google.token.title'),
          name: [LLMProviderConfigKey, providerKey, LLMProviderApiTokenKey],
        },
        {
          children: <Checker model={'gemini-pro'} provider={ModelProvider.Google} />,
          desc: t('llm.checker.desc'),
          label: t('llm.checker.title'),
          minWidth: '100%',
        },
      ]}
      provider={providerKey}
      title={
        <Flexbox align={'center'} gap={8} horizontal>
          <Google.BrandColor size={28} />
          <Divider style={{ margin: '0 4px' }} type={'vertical'} />
          <Gemini.Combine size={24} type={'color'} />
        </Flexbox>
      }
    />
  );
});

export default GoogleProvider;
