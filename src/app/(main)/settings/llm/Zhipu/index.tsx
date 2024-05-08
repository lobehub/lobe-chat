'use client';

import { Zhipu } from '@lobehub/icons';
import { memo } from 'react';

import ProviderConfig from '../components/ProviderConfig';

const ZhipuProvider = memo(() => {
  return (
    <ProviderConfig
      checkModel={'glm-3-turbo'}
      provider={'zhipu'}
      title={<Zhipu.Combine size={32} type={'color'} />}
    />
  );
});

export default ZhipuProvider;
