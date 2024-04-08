import { OpenAI } from '@lobehub/icons';
import { memo } from 'react';

import ProviderConfig from '../components/ProviderConfig';

const OpenAIProvider = memo(() => (
  <ProviderConfig
    canDeactivate={false}
    provider={'openai'}
    showEndpoint
    title={<OpenAI.Combine size={24} />}
  />
));

export default OpenAIProvider;
