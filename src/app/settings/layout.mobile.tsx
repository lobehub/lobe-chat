'use client';

import { PropsWithChildren } from 'react';
import { Flexbox } from 'react-layout-kit';

import AppMobileLayout from '@/layout/AppMobileLayout';

import Header from './features/Header';

const SettingLayout = ({ children }: PropsWithChildren) => (
  <AppMobileLayout navBar={<Header />}>
    <Flexbox style={{ overflow: 'auto' }}>{children}</Flexbox>
  </AppMobileLayout>
);

export default SettingLayout;
