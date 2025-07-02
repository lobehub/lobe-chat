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
        flexShrink: 0,
        overflowY: 'auto',
        width: 80,
        height: '100%',
        padding: '30px 10px 0',
      }}
    >
      <TopicsList />
    </Flexbox>
  );
};

Topics.displayName = 'Topics';

export default Topics;
