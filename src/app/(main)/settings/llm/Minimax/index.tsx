import { Minimax } from '@lobehub/icons';
import { useTheme } from 'antd-style';
import { memo } from 'react';

import { ModelProvider } from '@/libs/agent-runtime';

import ProviderConfig from '../components/ProviderConfig';

const MinimaxProvider = memo(() => {
  const theme = useTheme();

  return (
    <ProviderConfig
      checkModel={'abab5.5s-chat'}
      provider={ModelProvider.Minimax}
      title={
        <Minimax.Combine
          color={theme.isDarkMode ? theme.colorText : Minimax.colorPrimary}
          size={32}
        />
      }
    />
  );
});

export default MinimaxProvider;
