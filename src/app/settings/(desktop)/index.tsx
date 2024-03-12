'use client';

import dynamic from 'next/dynamic';
import { FC, memo } from 'react';

import ResponsiveContainer from '@/components/ResponsiveContainer';
import MobileSwitchLoading from '@/features/MobileSwitchLoading';
import { SettingsTabs } from '@/store/global/initialState';

import Common from '../common';
import { SettingsCommonProps } from '../common/Common';
import DesktopLayout from './layout.desktop';

const Mobile: FC = dynamic(() => import('../(mobile)'), {
  loading: MobileSwitchLoading,
  ssr: false,
}) as FC;

export default memo<SettingsCommonProps>((props) => (
  <ResponsiveContainer Mobile={Mobile}>
    <DesktopLayout activeTab={SettingsTabs.Common}>
      <Common {...props} />
    </DesktopLayout>
  </ResponsiveContainer>
));
