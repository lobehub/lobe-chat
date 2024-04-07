import { OpenRouter } from '@lobehub/icons';
import { useTheme } from 'antd-style';
import { memo } from 'react';

import { ModelProvider } from '@/libs/agent-runtime';

import ProviderConfig from '../components/ProviderConfig';

const OpenRouterProvider = memo(() => {
  const theme = useTheme();

  return (
    <ProviderConfig
      checkModel={'mistralai/mistral-7b-instruct:free'}
      provider={ModelProvider.OpenRouter}
      showCustomModelName
      title={
        <OpenRouter.Combine
          color={theme.isDarkMode ? theme.colorText : OpenRouter.colorPrimary}
          size={24}
        />
      }
    />
  );
});

export default OpenRouterProvider;
