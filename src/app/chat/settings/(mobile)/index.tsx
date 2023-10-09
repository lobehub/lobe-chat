'use client';

import { memo } from 'react';

import EditPage from '../features/EditPage';
import Layout from './layout.mobile';

const ChatSettings = memo(() => (
  <Layout>
    <EditPage />
  </Layout>
));

export default ChatSettings;
