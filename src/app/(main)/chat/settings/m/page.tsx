'use client';

import { useLayoutEffect } from 'react';

import { useQueryRoute } from '@/hooks/useQueryRoute';

export default () => {
  const router = useQueryRoute();

  useLayoutEffect(() => {
    router.replace('/chat/settings');
  }, []);

  return null;
};
