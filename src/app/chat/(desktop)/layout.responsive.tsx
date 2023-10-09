'use client';

import { PropsWithChildren, memo } from 'react';

import ResponsiveLayout from '@/components/ResponsiveLayout';
import { useIsMobile } from '@/hooks/useIsMobile';

import Mobile from '../(mobile)/layout.mobile';
import Desktop from './layout.desktop';

export default memo(({ children }: PropsWithChildren) => (
  <ResponsiveLayout Desktop={Desktop} Mobile={Mobile} isMobile={useIsMobile}>
    {children}
  </ResponsiveLayout>
));
