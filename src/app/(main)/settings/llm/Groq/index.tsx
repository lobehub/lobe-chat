import { Groq } from '@lobehub/icons';
import { useTheme } from 'antd-style';
import { memo } from 'react';

import { ModelProvider } from '@/libs/agent-runtime';

import ProviderConfig from '../components/ProviderConfig';

const GroqProvider = memo(() => {
  const theme = useTheme();

  return (
    <ProviderConfig
      checkModel={'gemma-7b-it'}
      provider={ModelProvider.Groq}
      title={<Groq.Text color={theme.isDarkMode ? theme.colorText : Groq.colorPrimary} size={24} />}
    />
  );
});

export default GroqProvider;
