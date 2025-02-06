'use client';

import { useLayoutEffect } from 'react';

import { useQueryRoute } from '@/hooks/useQueryRoute';

/**
 * @description: Chat Settings Modal (intercepting routes fallback when hard refresh)
 * @example: /chat/settings/modal?tab=prompt => /chat/settings
 * @refs: https://github.com/lobehub/lobe-chat/discussions/2295#discussioncomment-9290942
 */

const ChatSettingsModalFallback = () => {
  const router = useQueryRoute();

  useLayoutEffect(() => {
    router.replace('/chat/settings', { query: { tab: '' } });
  }, []);

  return null;
};

export default ChatSettingsModalFallback;
