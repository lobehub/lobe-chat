'use client';

import { DeepSeek } from '@lobehub/icons';
import { useTheme } from 'antd-style';
import { memo } from 'react';

import { ModelProvider } from '@/libs/agent-runtime';

import ProviderConfig from '../components/ProviderConfig';

const DeepSeekProvider = memo(() => {
  const theme = useTheme();

  return (
    <ProviderConfig
      checkModel={'deepseek/deepseek-chat'}
      provider={ModelProvider.DeepSeek}
      title={
        <DeepSeek.Combine
          color={theme.isDarkMode ? theme.colorText : DeepSeek.colorPrimary}
          size={28}
        />
      }
    />
  );
});

export default DeepSeekProvider;
