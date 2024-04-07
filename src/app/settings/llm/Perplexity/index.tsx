import { Perplexity } from '@lobehub/icons';
import { useTheme } from 'antd-style';
import { memo } from 'react';

import { ModelProvider } from '@/libs/agent-runtime';

import ProviderConfig from '../components/ProviderConfig';

const PerplexityProvider = memo(() => {
  const theme = useTheme();

  return (
    <ProviderConfig
      checkModel={'pplx-7b-chat'}
      provider={ModelProvider.Perplexity}
      title={
        <Perplexity.Combine
          color={theme.isDarkMode ? theme.colorText : Perplexity.colorPrimary}
          size={24}
        />
      }
    />
  );
});

export default PerplexityProvider;
