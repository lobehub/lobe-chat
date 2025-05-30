'use client';

import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { ApiKeyList } from './features';

const Page = memo(() => {
  return (
    <Flexbox gap={24} width={'100%'}>
      <ApiKeyList />
    </Flexbox>
  );
});

Page.displayName = 'ApiKeySetting';

export default Page;
