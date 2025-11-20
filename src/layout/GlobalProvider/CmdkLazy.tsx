'use client';

import dynamic from 'next/dynamic';
import { memo } from 'react';

// Lazy load the CMDK component with Next.js dynamic import
// This splits the CMDK code into a separate chunk that only loads when needed
// ssr: false ensures it only loads on the client side
const CmdkComponent = dynamic(() => import('./Cmdk'), {
  ssr: false,
});

const CmdkLazy = memo(() => <CmdkComponent />);

CmdkLazy.displayName = 'CmdkLazy';

export default CmdkLazy;
