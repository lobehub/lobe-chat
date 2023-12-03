'use client';

import dynamic from 'next/dynamic';
import { FC, memo } from 'react';

import ResponsiveIndex from '@/components/ResponsiveIndex';

import Common from '../common';
import { SettingsCommonProps } from '../common/Common';
import Layout from './layout.desktop';

const Mobile: FC = dynamic(() => import('../(mobile)'), { ssr: false }) as FC;

export default memo<SettingsCommonProps>((props) => (
  <ResponsiveIndex Mobile={Mobile}>
    <Layout>
      <Common {...props} />
    </Layout>
  </ResponsiveIndex>
));
