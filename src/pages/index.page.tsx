import { memo, useEffect } from 'react';

import { useSessionHydrated, useSessionStore } from '@/store/session';
import { sessionSelectors } from '@/store/session/selectors';

import Loading from './index/Loading';
import Welcome from './welcome/index.page';

const Home = memo(() => {
  const hydrated = useSessionHydrated();
  const [hasSession, switchSession] = useSessionStore((s) => [
    sessionSelectors.hasSessionList(s),
    s.switchSession,
  ]);

  useEffect(() => {
    if (hasSession) switchSession();
  }, [hasSession]);

  if (!hydrated) return <Loading />;

  return !hasSession ? <Welcome /> : <Loading />;
});

export default Home;
