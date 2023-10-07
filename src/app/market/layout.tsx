import { PropsWithChildren } from 'react';

import ResponsiveLayout from '@/components/ResponsiveLayout';
import { isMobileDevice } from '@/utils/responsive';

import Desktop from './(desktop)/layout';
import Mobile from './(mobile)/layout.mobile';

export default ({ children }: PropsWithChildren) => (
  <ResponsiveLayout Desktop={Desktop} Mobile={Mobile} isMobile={isMobileDevice}>
    {children}
  </ResponsiveLayout>
);
