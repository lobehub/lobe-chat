'use client';

import dynamic from 'next/dynamic';
import { FC, memo } from 'react';
import WithMobileContent from 'src/components/WithMobileContent';

import SessionHydration from '@/app/chat/components/SessionHydration';
import MobileSwitchLoading from '@/features/MobileSwitchLoading';

import EditPage from '../features/EditPage';
import Layout from './layout';

const Mobile: FC = dynamic(() => import('../(mobile)'), {
  loading: MobileSwitchLoading,
  ssr: false,
}) as FC;

const ChatSettings = memo(() => (
  <>
    <WithMobileContent Mobile={Mobile}>
      <Layout>
        <EditPage />
      </Layout>
    </WithMobileContent>
    <SessionHydration />
  </>
));

export default ChatSettings;
