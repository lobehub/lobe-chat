import { Ollama } from '@lobehub/icons';
import { Input } from 'antd';
import { useTheme } from 'antd-style';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import Checker from './Checker';
import ProviderConfig from '../components/ProviderConfig';
import { LLMProviderBaseUrlKey, LLMProviderConfigKey } from '../const';

const providerKey = 'ollama';

const OllamaProvider = memo(() => {
  const { t } = useTranslation('setting');
  const theme = useTheme();

  return (
    <ProviderConfig
      configItems={[
        {
          children: <Input allowClear placeholder={t('llm.Ollama.endpoint.placeholder')} />,
          desc: t('llm.Ollama.endpoint.desc'),
          label: t('llm.Ollama.endpoint.title'),
          name: [LLMProviderConfigKey, providerKey, LLMProviderBaseUrlKey],
        },
        {
          children: (
            <Input.TextArea
              allowClear
              placeholder={t('llm.Ollama.customModelName.placeholder')}
              style={{ height: 100 }}
            />
          ),
          desc: t('llm.Ollama.customModelName.desc'),
          label: t('llm.Ollama.customModelName.title'),
          name: [LLMProviderConfigKey, providerKey, 'customModelName'],
        },
        {
          children: <Checker />,
          desc: t('llm.Ollama.checker.desc'),
          label: t('llm.checker.title'),
          minWidth: undefined,
        },
      ]}
      provider={providerKey}
      title={
        <Ollama.Combine color={theme.isDarkMode ? theme.colorText : theme.colorPrimary} size={24} />
      }
    />
  );
});

export default OllamaProvider;
