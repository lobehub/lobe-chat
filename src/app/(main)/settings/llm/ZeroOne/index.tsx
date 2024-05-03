'use client';

import { ZeroOne } from '@lobehub/icons';
import { memo } from 'react';

import { ModelProvider } from '@/libs/agent-runtime';

import ProviderConfig from '../components/ProviderConfig';

const ZeroOneProvider = memo(() => {
  return (
    <ProviderConfig
      checkModel={'yi-34b-chat-0205'}
      provider={ModelProvider.ZeroOne}
      title={<ZeroOne.Text size={20} />}
    />
  );
});

export default ZeroOneProvider;
