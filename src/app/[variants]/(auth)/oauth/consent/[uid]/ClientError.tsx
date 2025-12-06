'use client';

import { FluentEmoji, Text } from '@lobehub/ui';
import { Result } from 'antd';
import React, { memo } from 'react';

interface ClientProps {
  error: {
    message: string;
    title: string;
  };
}

const ConsentClientError = memo<ClientProps>(({ error }) => {
  return (
    <Result
      icon={<FluentEmoji emoji={'🥵'} size={96} type={'anim'} />}
      status={'error'}
      subTitle={
        <Text fontSize={16} type="secondary">
          {error.message}
        </Text>
      }
      title={
        <Text fontSize={32} weight={'bold'}>
          {error.title}
        </Text>
      }
    />
  );
});

ConsentClientError.displayName = 'ConsentClientError';

export default ConsentClientError;
