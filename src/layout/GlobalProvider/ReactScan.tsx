'use client';

import Script from 'next/script';
import { useQueryState } from 'nuqs';
import React, { memo } from 'react';

import { withSuspense } from '@/components/withSuspense';

const ReactScan = memo(() => {
  const [debug] = useQueryState('debug', { clearOnDefault: true, defaultValue: '' });

  return !!debug && <Script src="https://unpkg.com/react-scan/dist/auto.global.js" />;
});

export default withSuspense(ReactScan);
