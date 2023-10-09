'use client';

import { PropsWithChildren } from 'react';

import ResponsiveLayout from '@/layout/ResponsiveLayout.client';

import Mobile from '../(mobile)/layout.mobile';
import Desktop from './layout.desktop';

const Market = ({ children }: PropsWithChildren) => (
  <ResponsiveLayout Desktop={Desktop} Mobile={Mobile}>
    {children}
  </ResponsiveLayout>
);

export default Market;
