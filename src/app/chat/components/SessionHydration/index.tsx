'use client';

import { useResponsive } from 'antd-style';
import { useRouter } from 'next/navigation';
import { useQueryState } from 'nuqs';
import { parseAsString } from 'nuqs/parsers';
import { memo, useEffect } from 'react';
import { createStoreUpdater } from 'zustand-utils';

import { useSessionStore } from '@/store/session';

// sync outside state to useSessionStore
const SessionHydration = memo(() => {
  const useStoreUpdater = createStoreUpdater(useSessionStore);

  const { mobile } = useResponsive();
  useStoreUpdater('isMobile', mobile);

  const router = useRouter();
  // TODO: 后续可以把 router 从 useSessionStore 移除
  useStoreUpdater('router', router);

  // two-way bindings the url and session store
  const [session, setSession] = useQueryState(
    'session',
    parseAsString.withDefault('inbox').withOptions({ history: 'replace', throttleMs: 500 }),
  );
  useStoreUpdater('activeId', session);

  useEffect(() => {
    const unsubscribe = useSessionStore.subscribe(
      (s) => s.activeId,
      (state) => setSession(state),
    );

    return () => {
      unsubscribe();
    };
  }, []);

  return null;
});

export default SessionHydration;
