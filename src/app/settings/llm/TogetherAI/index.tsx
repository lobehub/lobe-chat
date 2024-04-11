import { Together } from '@lobehub/icons';
import { useTheme } from 'antd-style';
import { memo } from 'react';

import ProviderConfig from '../components/ProviderConfig';

const TogetherAIProvider = memo(() => {
  const theme = useTheme();

  return (
    <ProviderConfig
      checkModel={'togethercomputer/alpaca-7b'}
      provider={'togetherai'}
      title={
        <Together.Combine
          color={theme.isDarkMode ? theme.colorText : Together.colorPrimary}
          size={24}
        />
      }
    />
  );
});

export default TogetherAIProvider;
