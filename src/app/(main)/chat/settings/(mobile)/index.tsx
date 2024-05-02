'use client';

import { memo } from 'react';

import MobileContentLayout from '@/components/server/MobileNavLayout';

import EditPage from '../features/EditPage';
import Header from './Header';

const ChatSettings = memo(() => (
  <MobileContentLayout header={<Header />} withNav={false}>
    <EditPage />
  </MobileContentLayout>
));

export default ChatSettings;
