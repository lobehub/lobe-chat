'use client';

import { PropsWithChildren } from 'react';

import ResponsiveLayout from '@/components/ResponsiveLayout';
import { useIsMobile } from '@/hooks/useIsMobile';

import Mobile from '../../(mobile)/layout.mobile';
import Desktop from './Desktop';

const Market = ({ children }: PropsWithChildren) => (
  <ResponsiveLayout Desktop={Desktop} Mobile={Mobile} isMobile={useIsMobile}>
    {children}
  </ResponsiveLayout>
);

export default Market;
