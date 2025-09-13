'use client';

import { Divider } from 'antd';
import React, { memo } from 'react';

import { useSessionStore } from '@/store/session';
import { sessionSelectors } from '@/store/session/selectors';

import Header from './Header';
import TopicListContent from './TopicListContent';

const Topic = memo(() => {
  const isInbox = useSessionStore(sessionSelectors.isInboxSession);

  return (
    <>
      {!isInbox && <Divider style={{ margin: 0 }} />}

      <Header />
      <TopicListContent />
    </>
  );
});

Topic.displayName = 'Topic';

export default Topic;
