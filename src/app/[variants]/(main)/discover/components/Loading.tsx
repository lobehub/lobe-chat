'use client';

import { Skeleton } from 'antd';
import { memo } from 'react';

import Title from './Title';

const Loading = memo<{ title: string }>(({ title }) => {
  return (
    <>
      <Title>{title}</Title>
      <Skeleton active paragraph={{ rows: 8 }} title={false} />
    </>
  );
});

export default Loading;
