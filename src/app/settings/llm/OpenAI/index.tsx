import { OpenAI } from '@lobehub/icons';
import { memo } from 'react';

import { featureFlagsSelectors, useServerConfigStore } from '@/store/serverConfig';

import ProviderConfig from '../components/ProviderConfig';

const OpenAIProvider = memo(() => {
  const { showOpenAIProxyUrl, showOpenAIApiKey } = useServerConfigStore(featureFlagsSelectors);

  return (
    <ProviderConfig
      modelList={{ showModelFetcher: true }}
      provider={'openai'}
      showApiKey={showOpenAIApiKey}
      showBrowserRequest
      showEndpoint={showOpenAIProxyUrl}
      title={<OpenAI.Combine size={24} />}
    />
  );
});

export default OpenAIProvider;
