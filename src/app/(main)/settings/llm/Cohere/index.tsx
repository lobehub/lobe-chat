'use client';

// TODO: FOR COHERE  FOR COHERE  Update icons
import { Cohere } from '@lobehub/icons';
import { useTheme } from 'antd-style';
import { memo } from 'react';

import { ModelProvider } from '@/libs/agent-runtime';

import ProviderConfig from '../components/ProviderConfig';

const CohereProvider = memo(() => {
  const { isDarkMode } = useTheme();
  return (
    <ProviderConfig
      checkModel={'command-r-plus'}
      provider={ModelProvider.Cohere}
      proxyUrl={{
        placeholder: 'https://api.cohere.ai',
      }}
    //   TODO: FOR COHERE UPDATE COHERE COLORS
      title={<Cohere.Text color={isDarkMode ? undefined : Cohere.colorPrimary} size={15} />}
    />
  );
});

export default CohereProvider;
