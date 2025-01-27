'use client';

import { useSearchParams } from 'next/navigation';
import Script from 'next/script';
import React, { memo } from 'react';

import { withSuspense } from '@/components/withSuspense';

const ReactScan = memo(() => {
  const searchParams = useSearchParams();

  const debug = searchParams.get('debug');

  return !!debug && <Script src="https://unpkg.com/react-scan/dist/auto.global.js" />;
});

export default withSuspense(ReactScan);
