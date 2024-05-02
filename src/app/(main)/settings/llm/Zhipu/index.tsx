import { Zhipu } from '@lobehub/icons';
import { useTheme } from 'antd-style';
import { lighten } from 'polished';
import { memo } from 'react';

import ProviderConfig from '../components/ProviderConfig';

const ZhipuProvider = memo(() => {
  const theme = useTheme();

  return (
    <ProviderConfig
      checkModel={'glm-3-turbo'}
      provider={'zhipu'}
      title={
        <Zhipu.Combine
          color={theme.isDarkMode ? lighten(0.1, Zhipu.colorPrimary) : Zhipu.colorPrimary}
          size={32}
        />
      }
    />
  );
});

export default ZhipuProvider;
