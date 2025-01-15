'use client';

import { useLayoutEffect } from 'react';
import urlJoin from 'url-join';

import { useQuery } from '@/hooks/useQuery';
import { useQueryRoute } from '@/hooks/useQueryRoute';
import { SettingsTabs } from '@/store/global/initialState';

/**
 * @description: Settings Modal (intercepting routes fallback when hard refresh)
 * @example: /settings/modal?tab=common => /settings/common
 * @refs: https://github.com/lobehub/lobe-chat/discussions/2295#discussioncomment-9290942
 */

const SettingsModalFallback = () => {
  const { tab = SettingsTabs.Common } = useQuery();
  const router = useQueryRoute();

  useLayoutEffect(() => {
    router.replace(urlJoin('/settings', tab as SettingsTabs), { query: { tab: '' } });
  }, []);

  return null;
};

export default SettingsModalFallback;
