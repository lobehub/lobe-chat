'use client';

import dynamic from 'next/dynamic';
import { memo } from 'react';

import { isServerMode } from '@/const/version';
import { useGlobalStore } from '@/store/global';
import { systemStatusSelectors } from '@/store/global/selectors';

const InitIndicator = dynamic(() => import('./InitIndicator'), {
  ssr: false,
});

interface InitClientDBProps {
  bottom?: number;
}

const InitClientDB = memo<InitClientDBProps>(({ bottom }) => {
  const isPgliteNotInited = useGlobalStore(systemStatusSelectors.isPgliteNotInited);

  if (isServerMode) return null;

  /* 当用户已经启用 pglite 但没有初始化时，展示初始化指示器 */
  return isPgliteNotInited && <InitIndicator bottom={bottom} show={isPgliteNotInited} />;
});

export default InitClientDB;
