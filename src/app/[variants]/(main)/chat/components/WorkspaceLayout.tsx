import { Suspense, memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import MainInterfaceTracker from '@/components/Analytics/MainInterfaceTracker';
import BrandTextLoading from '@/components/Loading/BrandTextLoading';
import MobileContentLayout from '@/components/server/MobileNavLayout';

import ChatHeaderDesktop from '../components/layout/Desktop/ChatHeader';
import Portal from '../components/layout/Desktop/Portal';
import TopicPanel from '../components/layout/Desktop/TopicPanel';
import ChatHeaderMobile from '../components/layout/Mobile/ChatHeader';
import TopicModal from '../components/layout/Mobile/TopicModal';
import Conversation from './conversation';
import PortalPanel from './PortalPanel';
import TopicSidebar from './TopicSidebar';


const DesktopWorkspace = memo(() => (
  <>
    <ChatHeaderDesktop />
    <Flexbox
      height={'100%'}
      horizontal
      style={{ overflow: 'hidden', position: 'relative' }}
      width={'100%'}
    >
      <Flexbox height={'100%'} style={{ overflow: 'hidden', position: 'relative' }} width={'100%'}>
        <Conversation mobile={false} />
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
  </>
));

DesktopWorkspace.displayName = 'DesktopWorkspace';

const MobileWorkspace = memo(() => (
  <>
    <MobileContentLayout header={<ChatHeaderMobile />} style={{ overflowY: 'hidden' }}>
      <Conversation mobile />
    </MobileContentLayout>
    <TopicModal>
      <TopicSidebar mobile />
    </TopicModal>
    <PortalPanel mobile />
    <MainInterfaceTracker />
  </>
));

MobileWorkspace.displayName = 'MobileWorkspace';

export { DesktopWorkspace, MobileWorkspace };
