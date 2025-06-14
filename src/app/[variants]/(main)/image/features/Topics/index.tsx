'use client';

import dynamic from 'next/dynamic';
import React from 'react';
import { Flexbox } from 'react-layout-kit';

import SkeletonList from './SkeletonList';

const TopicsList = dynamic(() => import('./TopicList'), {
  ssr: false,
  loading: () => <SkeletonList />,
});

const Topics = () => {
  return (
    <Flexbox
      align="center"
      style={{
        width: 80,
        padding: '30px 10px 0',
        height: '100%',
        overflowY: 'auto',
      }}
    >
      <TopicsList />
    </Flexbox>
  );
};

Topics.displayName = 'Topics';

export default Topics;
