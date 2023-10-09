import { PropsWithChildren, memo } from 'react';

import ResponsiveLayout from '@/layout/ResponsiveLayout.client';

import Mobile from '../(mobile)/layout.mobile';
import Desktop from './layout.desktop';

export default memo(({ children }: PropsWithChildren) => (
  <ResponsiveLayout Desktop={Desktop} Mobile={Mobile}>
    {children}
  </ResponsiveLayout>
));
