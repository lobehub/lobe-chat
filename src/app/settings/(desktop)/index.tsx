'use client';

import dynamic from 'next/dynamic';
import { FC, memo } from 'react';

import MobileSwitchLoading from '@/features/MobileSwitchLoading';
import { useIsMobile } from '@/hooks/useIsMobile';

import Common from '../common';
import { SettingsCommonProps } from '../common/Common';

const Mobile: FC = dynamic(() => import('../(mobile)'), {
  loading: MobileSwitchLoading,
  ssr: false,
}) as FC;

const Desktop = memo<SettingsCommonProps>((props) => {
  const mobile = useIsMobile();

  return mobile ? <Mobile /> : <Common {...props} />;
});

export default Desktop;
