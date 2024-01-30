'use client';

import dynamic from 'next/dynamic';
import { FC, memo } from 'react';

import SessionHydration from '@/app/chat/components/SessionHydration';
import ResponsiveIndex from '@/components/ResponsiveIndex';

import EditPage from '../features/EditPage';
import Layout from './layout.desktop';

const Mobile: FC = dynamic(() => import('../(mobile)'), { ssr: false }) as FC;

const ChatSettings = memo(() => (
  <>
    <ResponsiveIndex Mobile={Mobile}>
      <Layout>
        <EditPage />
      </Layout>
    </ResponsiveIndex>
    <SessionHydration />
  </>
));

export default ChatSettings;
