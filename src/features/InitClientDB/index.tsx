'use client';

import { Spin } from 'antd';
import dynamic from 'next/dynamic';
import { memo } from 'react';

import { useGlobalStore } from '@/store/global';
import { systemStatusSelectors } from '@/store/global/selectors';

const Modal = dynamic(() => import('./EnableModal'), {
  loading: () => <Spin fullscreen />,
  ssr: false,
});

const InitIndicator = dynamic(() => import('./InitIndicator'), {
  ssr: false,
});

interface InitClientDBProps {
  bottom?: number;
}

const InitClientDB = memo<InitClientDBProps>(({ bottom }) => {
  const isPgliteNotEnabled = useGlobalStore(systemStatusSelectors.isPgliteNotEnabled);
  const isPgliteNotInited = useGlobalStore(systemStatusSelectors.isPgliteNotInited);

  return (
    <>
      {/* 当用户没有设置启用 pglite 时，强弹窗引导用户来开启弹窗 */}
      {isPgliteNotEnabled && <Modal open={isPgliteNotEnabled} />}
      {/* 当用户已经启用 pglite 但没有初始化时，展示初始化指示器 */}
      {isPgliteNotInited && <InitIndicator bottom={bottom} show={isPgliteNotInited} />}
    </>
  );
});

export default InitClientDB;
