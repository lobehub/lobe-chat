'use client';

import { Highlighter } from '@lobehub/ui';
import { Skeleton } from 'antd';
import { memo } from 'react';

import Block from '../../../features/Block';

const Schema = memo<{ children?: string }>(({ children }) => {
  return (
    <Block title={'JSON Schema'}>
      {children ? (
        <Highlighter allowChangeLanguage={false} fullFeatured language={'json'}>
          {children}
        </Highlighter>
      ) : (
        <Skeleton paragraph={{ rows: 4 }} title={false} />
      )}
    </Block>
  );
});

export default Schema;
