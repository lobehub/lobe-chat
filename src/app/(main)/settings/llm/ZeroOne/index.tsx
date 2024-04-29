import { ZeroOne } from '@lobehub/icons';
import { useTheme } from 'antd-style';
import { memo } from 'react';

import { ModelProvider } from '@/libs/agent-runtime';

import ProviderConfig from '../components/ProviderConfig';

const ZeroOneProvider = memo(() => {
  const theme = useTheme();

  return (
    <ProviderConfig
      checkModel={'yi-34b-chat-0205'}
      provider={ModelProvider.ZeroOne}
      title={
        <ZeroOne.Combine
          color={theme.isDarkMode ? theme.colorText : ZeroOne.colorPrimary}
          size={32}
        />
      }
    />
  );
});

export default ZeroOneProvider;
