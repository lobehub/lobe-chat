'use client';

import dynamic from 'next/dynamic';
import { FC, memo } from 'react';
import WithMobileContent from 'src/components/WithMobileContent';

import MobileSwitchLoading from '@/features/MobileSwitchLoading';

import Common from '../common';
import { SettingsCommonProps } from '../common/Common';

const Mobile: FC = dynamic(() => import('../(mobile)'), {
  loading: MobileSwitchLoading,
  ssr: false,
}) as FC;

export default memo<SettingsCommonProps>((props) => (
  <WithMobileContent Mobile={Mobile}>
    <Common {...props} />
  </WithMobileContent>
));
