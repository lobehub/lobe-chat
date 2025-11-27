'use client';

import dynamic from 'next/dynamic';
import { memo } from 'react';

// Lazy load the CommandMenu component with Next.js dynamic import
// This splits the CommandMenu code into a separate chunk that only loads when needed
// ssr: false ensures it only loads on the client side
const CmdkComponent = dynamic(() => import('@/features/CommandMenu'), {
  ssr: false,
});

const CmdkLazy = memo(() => <CmdkComponent />);

CmdkLazy.displayName = 'CmdkLazy';

export default CmdkLazy;
