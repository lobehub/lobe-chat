import { PropsWithChildren, memo } from 'react';

import ResponsiveLayout from '@/layout/ResponsiveLayout.server';

import DesktopLayout from './(desktop)/layout.responsive';
import MobileLayout from './(mobile)/layout.mobile';

export default memo(({ children }: PropsWithChildren) => (
  <ResponsiveLayout Desktop={DesktopLayout} Mobile={MobileLayout}>
    {children}
  </ResponsiveLayout>
));
