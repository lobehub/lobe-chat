'use client';

import dynamic from 'next/dynamic';
import { FC } from 'react';

import { getDebugConfig } from '@/config/debug';

let DebugUI: FC = () => null;

// we need use Constant Folding to remove code below in production
// refs: https://webpack.js.org/plugins/internal-plugins/#constplugin
if (process.env.NODE_ENV === 'development') {
  // eslint-disable-next-line unicorn/no-lonely-if
  if (getDebugConfig().DEBUG_MODE) {
    // @ts-ignore
    DebugUI = dynamic(() => import('./Content'), { ssr: false });
  }
}

export default DebugUI;
