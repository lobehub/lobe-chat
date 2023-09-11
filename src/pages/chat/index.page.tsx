import { useResponsive } from 'antd-style';
import Head from 'next/head';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { useSessionStore } from '@/store/session';
import { useEffectAfterSessionHydrated } from '@/store/session/hooks';
import { agentSelectors } from '@/store/session/selectors';
import { genSiteHeadTitle } from '@/utils/genSiteHeadTitle';

import Conversation from './features/Conversation';
import Header from './features/Header';
import SideBar from './features/Sidebar';
import DesktopLayout from './layout';
import MobileLayout from './layout.mobile';

const Chat = memo(() => {
  const { mobile } = useResponsive();
  const [avatar, title] = useSessionStore((s) => [
    agentSelectors.currentAgentAvatar(s),
    agentSelectors.currentAgentTitle(s),
  ]);
  const pageTitle = genSiteHeadTitle([avatar, title].filter(Boolean).join(' '));
  const RenderLayout = mobile ? MobileLayout : DesktopLayout;

  useEffectAfterSessionHydrated(
    (store) => {
      store.setState({ isMobile: mobile });
    },
    [mobile],
  );

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
      </Head>
      <RenderLayout>
        {!mobile && (
          <>
            <Header />
            <Flexbox flex={1} height={'calc(100vh - 64px)'} horizontal>
              <Conversation />
              <SideBar />
            </Flexbox>
          </>
        )}
      </RenderLayout>
    </>
  );
});
export default Chat;
