import { Mistral } from '@lobehub/icons';
import { useTheme } from 'antd-style';
import { memo } from 'react';

import { ModelProvider } from '@/libs/agent-runtime';

import ProviderConfig from '../components/ProviderConfig';

const MistralProvider = memo(() => {
  const theme = useTheme();

  return (
    <ProviderConfig
      checkModel={'open-mistral-7b'}
      provider={ModelProvider.Mistral}
      title={
        <Mistral.Combine
          color={theme.isDarkMode ? theme.colorText : Mistral.colorPrimary}
          size={24}
        />
      }
    />
  );
});

export default MistralProvider;
