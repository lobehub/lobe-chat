'use client';

import React, { memo } from 'react';

import Header from './Header';
import TopicListContent from './TopicListContent';

const Topic = memo(() => {
  return (
    <>
      <Header />
      <TopicListContent />
    </>
  );
});

Topic.displayName = 'Topic';

export default Topic;
