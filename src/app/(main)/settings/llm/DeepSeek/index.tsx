import { DeepSeek } from '@lobehub/icons';      //待加入
import { useTheme } from 'antd-style';
import { memo } from 'react';

import { ModelProvider } from '@/libs/agent-runtime';

import ProviderConfig from '../components/ProviderConfig';

const DeepSeekProvider = memo(() => {
  const theme = useTheme();

  return (
    <ProviderConfig
      checkModel={'abab5.5s-chat'}
      provider={ModelProvider.DeepSeek}
      title={
        <DeepSeek.Combine
          color={theme.isDarkMode ? theme.colorText : DeepSeek.colorPrimary}
          size={32}
        />
      }
    />
  );
});

export default DeepSeekProvider;