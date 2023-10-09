'use client';

import { PropsWithChildren, memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import AppLayoutMobile from '@/layout/AppLayout.mobile';

import Header from './features/Header';

export default memo(({ children }: PropsWithChildren) => (
  <AppLayoutMobile navBar={<Header />}>
    <Flexbox style={{ overflow: 'auto' }}>{children}</Flexbox>
  </AppLayoutMobile>
));
