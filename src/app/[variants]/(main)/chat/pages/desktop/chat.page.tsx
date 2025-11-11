'use client';

import { memo , Suspense} from 'react';

import { Flexbox } from 'react-layout-kit';


import MainInterfaceTracker from '@/components/Analytics/MainInterfaceTracker';
import BrandTextLoading from '@/components/Loading/BrandTextLoading';

import ChatHeaderDesktop from '../../components/layout/Desktop/ChatHeader';
import Portal from '../../components/layout/Desktop/Portal';
import TopicPanel from '../../components/layout/Desktop/TopicPanel';
import ConversationArea from '../../components/ConversationArea';
import PortalPanel from '../../components/PortalPanel';
import TopicSidebar from '../../components/TopicSidebar';
import TelemetryNotification from '../../components/features/TelemetryNotification';
import PageTitle from '../../features/PageTitle';


export const DesktopChatPage = memo(() => {
  return (
   <>
    <PageTitle />
    <ChatHeaderDesktop />
    <Flexbox
      height={'100%'}
      horizontal
      style={{ overflow: 'hidden', position: 'relative' }}
      width={'100%'}
    >
      <Flexbox height={'100%'} style={{ overflow: 'hidden', position: 'relative' }} width={'100%'}>
        <ConversationArea mobile={false} />
      </Flexbox>
      <Portal>
        <Suspense fallback={<BrandTextLoading />}>
          <PortalPanel mobile={false} />
        </Suspense>
      </Portal>
      <TopicPanel>
        <TopicSidebar mobile={false} />
      </TopicPanel>
    </Flexbox>
    <MainInterfaceTracker />
    <TelemetryNotification mobile={false} />
   </>
  );
});

DesktopChatPage.displayName = 'DesktopChatPage';
