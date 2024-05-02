'use client';

import { Gemini, Google } from '@lobehub/icons';
import { Divider } from 'antd';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { ModelProvider } from '@/libs/agent-runtime';

import ProviderConfig from '../components/ProviderConfig';

const GoogleProvider = memo(() => {
  return (
    <ProviderConfig
      checkModel={'gemini-pro'}
      provider={ModelProvider.Google}
      showEndpoint
      title={
        <Flexbox align={'center'} gap={8} horizontal>
          <Google.BrandColor size={22} />
          <Divider style={{ margin: '0 4px' }} type={'vertical'} />
          <Gemini.Combine size={22} type={'color'} />
        </Flexbox>
      }
    />
  );
});

export default GoogleProvider;
