import { Moonshot } from '@lobehub/icons';
import { useTheme } from 'antd-style';
import { memo } from 'react';

import { ModelProvider } from '@/libs/agent-runtime';

import ProviderConfig from '../components/ProviderConfig';

const MoonshotProvider = memo(() => {
  const theme = useTheme();

  return (
    <ProviderConfig
      checkModel={'moonshot-v1-8k'}
      provider={ModelProvider.Moonshot}
      title={
        <Moonshot.Combine
          color={theme.isDarkMode ? theme.colorText : Moonshot.colorPrimary}
          size={24}
        />
      }
    />
  );
});

export default MoonshotProvider;
