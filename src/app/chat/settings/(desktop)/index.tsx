'use client';

import dynamic from 'next/dynamic';
import { FC, memo } from 'react';

import SessionHydration from '@/app/chat/components/SessionHydration';
import ResponsiveContainer from '@/components/ResponsiveContainer';
import MobileSwitchLoading from '@/features/MobileSwitchLoading';

import EditPage from '../features/EditPage';
import Layout from './layout.desktop';

const Mobile: FC = dynamic(() => import('../(mobile)'), {
  loading: MobileSwitchLoading,
  ssr: false,
}) as FC;

const ChatSettings = memo(() => (
  <>
    <ResponsiveContainer Mobile={Mobile}>
      <Layout>
        <EditPage />
      </Layout>
    </ResponsiveContainer>
    <SessionHydration />
  </>
));

export default ChatSettings;
