'use client';

import { useSearchParams } from 'next/navigation';
import Script from 'next/script';
import React, { memo } from 'react';

const Debug = memo(() => {
  const searchParams = useSearchParams();

  const debug = searchParams.get('debug');

  return !!debug && <Script src="https://unpkg.com/react-scan/dist/auto.global.js" />;
});

export default Debug;
