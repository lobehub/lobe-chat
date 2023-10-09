'use client';

import { memo } from 'react';

import PageTitle from '../features/PageTitle';
import SessionList from './features/SessionList';
import Layout from './layout.mobile';

const ChatMobilePage = memo(() => {
  return (
    <Layout>
      <PageTitle />
      <SessionList />
    </Layout>
  );
});

export default ChatMobilePage;
