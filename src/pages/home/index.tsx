'use client';

import { memo } from 'react';

import Loading from '@/pages/home/Loading';
import {
  useEffectAfterSessionHydrated,
  useSessionHydrated,
  useSessionStore,
} from '@/store/session';
import { sessionSelectors } from '@/store/session/selectors';

import Welcome from '../welcome';

const Home = memo(() => {
  const hydrated = useSessionHydrated();
  const [hasSession, switchSession] = useSessionStore((s) => [
    sessionSelectors.hasSessionList(s),
    s.switchSession,
  ]);

  useEffectAfterSessionHydrated(() => {
    if (hasSession) switchSession();
  }, [hasSession]);

  if (!hydrated) return <Loading />;

  return !hasSession ? <Welcome /> : <Loading />;
});

export default Home;
