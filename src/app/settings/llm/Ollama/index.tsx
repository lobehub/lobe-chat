import { Ollama } from '@lobehub/icons';
import { useTheme } from 'antd-style';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { ModelProvider } from '@/libs/agent-runtime';

import ProviderConfig from '../components/ProviderConfig';
import Checker from './Checker';

const OllamaProvider = memo(() => {
  const { t } = useTranslation('setting');
  const theme = useTheme();

  return (
    <ProviderConfig
      checkerItem={{
        children: <Checker />,
        desc: t('llm.ollama.checker.desc'),
        label: t('llm.checker.title'),
        minWidth: undefined,
      }}
      provider={ModelProvider.Ollama}
      showApiKey={false}
      showCustomModelName
      showEndpoint
      title={
        <Ollama.Combine color={theme.isDarkMode ? theme.colorText : theme.colorPrimary} size={24} />
      }
    />
  );
});

export default OllamaProvider;
