import { memo } from 'react';

import { sessionSelectors, useSessionHydrated, useSessionStore } from '@/store/session';

import Chat from './chat/index.page';
import Loading from './index/Loading';
import Welcome from './welcome/index.page';

const Home = memo(() => {
  const hydrated = useSessionHydrated();
  const hasSession = useSessionStore(sessionSelectors.hasSessionList);

  if (!hydrated) return <Loading />;

  return !hasSession ? <Welcome /> : <Chat />;
});

export default Home;
