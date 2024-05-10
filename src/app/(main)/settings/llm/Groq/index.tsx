'use client';

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
      proxyUrl={{
        placeholder: 'https://api.groq.com/openai/v1',
      }}
      title={<Groq.Text color={theme.isDarkMode ? theme.colorText : Groq.colorPrimary} size={20} />}
    />
  );
});

export default GroqProvider;
