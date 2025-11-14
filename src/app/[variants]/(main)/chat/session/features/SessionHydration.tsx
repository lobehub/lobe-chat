'use client';

import { memo, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { createStoreUpdater } from 'zustand-utils';

import { parseAsString, useQueryParam } from '@/hooks/useQueryParam';
import { useAgentStore } from '@/store/agent';
import { useChatStore } from '@/store/chat';
import { useSessionStore } from '@/store/session';

const THROTTLE_DELAY = 100;

// sync outside state to useSessionStore
const SessionHydration = memo(() => {
  const useStoreUpdater = createStoreUpdater(useSessionStore);
  const useAgentStoreUpdater = createStoreUpdater(useAgentStore);
  const useChatStoreUpdater = createStoreUpdater(useChatStore);
  const [switchTopic] = useChatStore((s) => [s.switchTopic]);

  const lastUpdateTimeRef = useRef<number>(0);
  const [searchParams, setSearchParams] = useSearchParams();

  // two-way bindings the url and session store
  const [session, setSession] = useQueryParam('session', parseAsString.withDefault('inbox'), {
    history: 'replace',
    throttleMs: 0,
  });
  const searchParamsRef = useRef(searchParams);
  const setSearchParamsRef = useRef(setSearchParams);
  const setSessionRef = useRef(setSession);
  const switchTopicRef = useRef(switchTopic);

  useEffect(() => {
    searchParamsRef.current = searchParams;
    setSearchParamsRef.current = setSearchParams;
    setSessionRef.current = setSession;
    switchTopicRef.current = switchTopic;
  });
  useStoreUpdater('activeId', session);
  useAgentStoreUpdater('activeId', session);
  useChatStoreUpdater('activeId', session);

  useEffect(() => {
    const unsubscribe = useSessionStore.subscribe(
      (s) => s.activeId,
      (state) => {
        const now = Date.now();
        const timeSinceLastUpdate = now - lastUpdateTimeRef.current;

        // 如果距离上次更新不足 100ms，忽略此次变更
        if (timeSinceLastUpdate < THROTTLE_DELAY) {
          return;
        }

        lastUpdateTimeRef.current = now;
        const currentParams = searchParamsRef.current;
        if (currentParams.get('session') !== state) {
          // 如果 session 已经更新，则忽略此次变更，并且删除 topic 和 thread
          setSession(state);
          return;
        }

        const newSearchParams = new URLSearchParams(currentParams);
        // 删除 topic 和 thread
        newSearchParams.delete('topic');
        newSearchParams.delete('thread');
        // 设置新的 session
        newSearchParams.set('session', state);
        setSearchParamsRef.current(newSearchParams, { replace: true });
        switchTopicRef.current();
      },
    );

    return () => {
      unsubscribe();
    };
  }, []);

  return null;
});

export default SessionHydration;
