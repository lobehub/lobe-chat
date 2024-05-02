'use client';

import { useLayoutEffect } from 'react';
import urlJoin from 'url-join';

import { useQuery } from '@/hooks/useQuery';
import { useQueryRoute } from '@/hooks/useQueryRoute';
import { SettingsTabs } from '@/store/global/initialState';

export default () => {
  const { tab = SettingsTabs.Common } = useQuery();
  const router = useQueryRoute();

  useLayoutEffect(() => {
    router.replace(urlJoin('/settings', tab as string), { tab: null });
  }, []);

  return null;
};
