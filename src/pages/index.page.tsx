import { useRouter } from 'next/router';
import { memo, useEffect } from 'react';

import { SESSION_CHAT_URL } from '@/const/url';
import { useSessionHydrated, useSessionStore } from '@/store/session';
import { sessionSelectors } from '@/store/session/selectors';

import Loading from './index/Loading';
import Welcome from './welcome/index.page';

const Home = memo(() => {
  const hydrated = useSessionHydrated();
  const hasSession = useSessionStore(sessionSelectors.hasSessionList);

  const router = useRouter();

  useEffect(() => {
    if (hasSession) router.replace(SESSION_CHAT_URL());
  }, [hasSession]);

  if (!hydrated) return <Loading />;

  return !hasSession ? <Welcome /> : <Loading />;
});

export default Home;
