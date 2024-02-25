'use client';

import { PropsWithChildren, memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import AppLayoutMobile from '@/layout/AppLayout.mobile';

import Header from '../features/Header/Home';

export default memo(({ children }: PropsWithChildren) => (
  <AppLayoutMobile navBar={<Header />} showTabBar>
    <Flexbox style={{ overflow: 'scroll' }}>{children}</Flexbox>
  </AppLayoutMobile>
));
