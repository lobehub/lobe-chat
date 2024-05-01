'use client';

import { Together } from '@lobehub/icons';
import { memo } from 'react';

import ProviderConfig from '../components/ProviderConfig';

const TogetherAIProvider = memo(() => {
  return (
    <ProviderConfig
      checkModel={'togethercomputer/alpaca-7b'}
      modelList={{ showModelFetcher: true }}
      provider={'togetherai'}
      title={<Together.Combine size={26} type={'color'} />}
    />
  );
});

export default TogetherAIProvider;
