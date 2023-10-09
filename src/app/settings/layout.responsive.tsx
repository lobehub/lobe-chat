import { PropsWithChildren, memo } from 'react';

import ResponsiveLayout from '@/components/ResponsiveLayout';
import { isMobileDevice } from '@/utils/responsive';

import DesktopLayout from './(desktop)/layout.responsive';
import MobileLayout from './(mobile)/layout.mobile';

export default memo(({ children }: PropsWithChildren) => (
  <ResponsiveLayout Desktop={DesktopLayout} Mobile={MobileLayout} isMobile={isMobileDevice}>
    {children}
  </ResponsiveLayout>
));
