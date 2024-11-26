'use client';

import { useQueryState } from 'nuqs';
import { memo, useEffect, useLayoutEffect } from 'react';
import { createStoreUpdater } from 'zustand-utils';

import { useChatStore } from '@/store/chat';

// sync outside state to useChatStore
const ThreadHydration = memo(() => {
  const useStoreUpdater = createStoreUpdater(useChatStore);

  // two-way bindings the topic params to chat store
  const [portalThread, setThread] = useQueryState('portalThread');
  useStoreUpdater('portalThreadId', portalThread);

  useLayoutEffect(() => {
    const unsubscribe = useChatStore.subscribe(
      (s) => s.portalThreadId,
      (state) => {
        setThread(!state ? null : state);
      },
    );

    return () => {
      unsubscribe();
    };
  }, []);

  // should open portal automatically when portalThread is set
  useEffect(() => {
    if (!!portalThread && !useChatStore.getState().showPortal) {
      useChatStore.getState().togglePortal(true);
    }
  }, [portalThread]);

  const [activeTopicId, useFetchThreads] = useChatStore((s) => [
    s.activeTopicId,
    s.useFetchThreads,
  ]);

  useFetchThreads(activeTopicId);

  return null;
});

export default ThreadHydration;
