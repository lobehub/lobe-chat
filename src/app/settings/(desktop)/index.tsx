'use client';

import dynamic from 'next/dynamic';
import { FC, memo } from 'react';

import ResponsiveIndex from '@/components/ResponsiveIndex';
import { SettingsTabs } from '@/store/global/initialState';

import Common from '../common';
import { SettingsCommonProps } from '../common/Common';
import DesktopLayout from './layout.desktop';

const Mobile: FC = dynamic(() => import('../(mobile)'), { ssr: false }) as FC;

export default memo<SettingsCommonProps>((props) => (
  <ResponsiveIndex Mobile={Mobile}>
    <DesktopLayout activeTab={SettingsTabs.Common}>
      <Common {...props} />
    </DesktopLayout>
  </ResponsiveIndex>
));
