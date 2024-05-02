import { Anthropic, Claude } from '@lobehub/icons';
import { useTheme } from 'antd-style';
import { memo } from 'react';

import { ModelProvider } from '@/libs/agent-runtime';

import ProviderConfig from '../components/ProviderConfig';

const AnthropicProvider = memo(() => {
  const theme = useTheme();

  return (
    <ProviderConfig
      checkModel={'claude-3-haiku-20240307'}
      provider={ModelProvider.Anthropic}
      showEndpoint
      title={
        <Anthropic.Text
          color={theme.isDarkMode ? theme.colorText : Claude.colorPrimary}
          size={18}
        />
      }
    />
  );
});

export default AnthropicProvider;
