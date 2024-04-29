'use client';

import { memo } from 'react';

import EditPage from '../features/EditPage';
import Header from './Header';

const ChatSettings = memo(() => (
  <>
    <Header />
    <EditPage />
  </>
));

export default ChatSettings;
