'use client';

import dynamic from 'next/dynamic';
import React from 'react';

import SkeletonList from './SkeletonList';

const TopicsList = dynamic(() => import('./TopicList'), {
  ssr: false,
  loading: () => <SkeletonList />,
});

const Topics = () => {
  return <TopicsList />;
};

Topics.displayName = 'Topics';

export default Topics;
